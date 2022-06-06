import { supabase } from '../../supabaseClient'
import { dexie, File } from '../../dexieClient'
import hex2buf from '../hex2buf'
import downloadWfs from '../downloadWfs'

import addCapabilitiesToIncoming from './addCapabilitiesToIncoming'

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

  // 4. update dexie with these changes
  //    Some tables have extra data - needs to be preserved
  if (data) {
    // console.log('processTable, got data for:', tableNameForDexie)
    // 4.1 keep values of local fields
    //     or fetch capabilities
    if (['tile_layers', 'project_vector_layers'].includes(tableName)) {
      const incomings = []
      for (const object of data) {
        const incoming = await addCapabilitiesToIncoming({
          object,
          tableName,
        })
        incomings.push(incoming)
      }
      await dexie.table(tableName).bulkPut(incomings)
    } else {
      try {
        await dexie.table(tableNameForDexie).bulkPut(data)
      } catch (error) {
        console.error(`error putting ${tableName}:`, error)
      }
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
     * Only it's layer data. Reduce server storage!
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
            downloadWfs({ pvl, store })
          }
        }
      }
    }
  }
}

export default processTable
