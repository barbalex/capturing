import axios from 'redaxios'

import { supabase } from '../../supabaseClient'
import { dexie, File } from '../../dexieClient'
import hex2buf from '../hex2buf'
import fetchWmsGetCapabilities from '../getCapabilities'
import downloadWfs from '../downloadWfs'

const fallbackRevAt = '1970-01-01T00:01:0.0Z'

const processTable = async ({ table: tableName, store, hiddenError }) => {
  // dexie does not accept 'tables' as a table name > named it ttables
  const tableNameForDexie = tableName === 'tables' ? 'ttables' : tableName
  // 1. get last_updated_at from dexie
  const last = await dexie
    .table(tableNameForDexie)
    .orderBy('server_rev_at')
    .reverse()
    .first()
  // console.log(`ServerSubscriber, last ${tableName} in dexie:`, last)
  const lastUpdatedAt = last?.server_rev_at ?? fallbackRevAt
  // 2. subscribe for changes and update dexie with changes from subscription
  // TODO: catch errors
  // TODO: Error 413: Payload Too Large. See: https://github.com/supabase/realtime/issues/252
  supabase
    .from(tableName)
    // TODO: only subscribe to id for files, then fetch row with separate query?
    .on('*', (payload) => {
      // console.log(`${tableName} subscription, payload:`, payload)
      const payloadErrors = payload.errors
      if (payloadErrors) return
      if (payload.new?.file) payload.new.file = hex2buf(payload.new.file)
      dexie.table(tableNameForDexie).put(payload.new)
    })
    .subscribe((status) => {
      if (tableName === 'projects') {
        // console.log(`processTable, subscribe callback, status:`, status)
        if (store.subscriptionState !== status) {
          store.setSubscriptionState(status)
        }
        if (status === 'SUBSCRIPTION_ERROR') {
          if (document.visibilityState === 'hidden') {
            // page visible so let realtime reconnect and reload data
            supabase.removeAllSubscriptions()
            hiddenError = true
          }
        }
      }
    })
  // 3. fetch all with newer last_updated_at
  const { data, error: error } = await supabase
    .from(tableName)
    .select('*')
    .gte('server_rev_at', lastUpdatedAt)
  if (error) {
    return console.log(
      `ServerSubscriber, error fetching ${tableName} from supabase:`,
      error,
    )
  }
  if (tableName === 'rows') {
    console.log(
      `ServerSubscriber, last ${tableName} fetched from supabase:`,
      data,
    )
  }
  // 4. update dexie with these changes
  if (data) {
    // 4.1 update dexie
    try {
      await dexie.table(tableNameForDexie).bulkPut(data)
    } catch (error) {
      console.log(`error putting ${tableName}:`, error)
    }
    // 4.2 if files_meta: need to sync files
    if (tableName === 'files_meta') {
      for (const d of data) {
        if (d.deleted === 0) {
          // fetch to Files
          const { data, error } = await supabase.storage
            .from('files')
            .download(`files/${d.id}`)
          if (error) return console.log(error)
          const newFile = new File(d.id, data)
          dexie.files.put(newFile)
        } else {
          // remove from Files
          dexie.files.delete(d.id)
        }
      }
    }
    /**
     * 4.3 if:
     * - project_vector_layers
     * - and: type 'wfs'
     * - and: no pvl_geoms yet
     * download the data from the wfs service and populate dexie!
     * Reason: wfs data itself is not synced via the server,
     * Only it's layer data. Reduce storage!
     */
    if (tableName === 'project_vector_layers') {
      for (const pvl of data) {
        if (
          pvl.type === 'wfs' &&
          pvl.type_name &&
          pvl.wfs_version &&
          pvl.output_format
        ) {
          const count = await dexie.pvl_geoms
            .where({ deleted: 0, pvl_id: pvl.id })
            .count()
          if (count === 0) {
            // console.log('processTable, pvl:', pvl)
            downloadWfs({ pvl, store })
          }
        }
      }
    }
    /**
     * 4.4 if:
     * - project_tile_layers
     * - and: type 'wms'
     * - and: no wms_legends yet
     * download the legends from the wms service and populate dexie!
     */
    if (tableName === 'project_tile_layers') {
      for (const d of data) {
        if (d.type === 'wms' && !d.wms_legends?.length) {
          // console.log('processTable processing project_tile_layers, title:', d)
          const capabilities = await fetchWmsGetCapabilities(d?.wms_base_url)
          const layers = capabilities?.Capability?.Layer?.Layer ?? []
          const lUrls = layers
            .map((l) => ({
              title: l.Title,
              url: l.Style?.[0]?.LegendURL?.[0]?.OnlineResource,
            }))
            .filter((u) => !!u.url)
          const _legendBlobs = []
          for (const lUrl of lUrls) {
            let res
            try {
              res = await axios.get(lUrl.url, {
                responseType: 'blob',
              })
            } catch (error) {
              // error can also be caused by timeout
              console.log(
                `error fetching legend for layer '${lUrl.title}':`,
                error,
              )
              break
            }
            if (res.data) _legendBlobs.push([lUrl.title, res.data])
          }

          if (_legendBlobs.length) {
            // add legends into row to reduce network activity and make them offline available
            await dexie.project_tile_layers.update(d.id, {
              wms_legends: _legendBlobs,
            })
          }
        }
      }
    }
  }
}

export default processTable
