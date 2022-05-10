import axios from 'redaxios'

import { supabase } from '../../supabaseClient'
import { dexie, File, PVLGeom } from '../../dexieClient'
import hex2buf from '../hex2buf'

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
      for (const d of data) {
        if (d.type === 'wfs') {
          const count = await dexie.pvl_geoms
            .where({ deleted: 0, pvl_id: d.id })
            .count()
          if (count === 0) {
            // 1. download
            let res
            try {
              res = await axios({
                method: 'get',
                url: d.url,
                params: {
                  service: 'WFS',
                  version: d.wfs_version,
                  request: 'GetFeature',
                  typeName: d.type_name,
                  srsName: 'EPSG:4326',
                  outputFormat: d.output_format,
                },
              })
            } catch (error) {
              return
            }
            const features = res.data?.features
            // 2. build PVLGeoms
            const pvlGeoms = features.map(
              (feature) =>
                new PVLGeom(
                  undefined,
                  d.id,
                  feature.geometry,
                  feature.properties,
                ),
            )
            // 3. add to dexie
            await dexie.pvl_geoms.bulkPut(pvlGeoms)
          }
        }
      }
    }
  }
}

export default processTable
