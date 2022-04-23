import { supabase } from '../../supabaseClient'
import { dexie } from '../../dexieClient'
import hex2buf from '../hex2buf'

const fallbackRevAt = '1970-01-01T00:01:0.0Z'

const processTable = async ({ table: tableName, store, hiddenError }) => {
  // dexie does not accept 'tables' as a table name > named it ttables
  const tableNameForDexie = tableName === 'tables' ? 'ttables' : tableName
  // 1. projects
  // 1.1. get last_updated_at from dexie
  const last = await dexie
    .table(tableNameForDexie)
    .orderBy('server_rev_at')
    .reverse()
    .first()
  // console.log(`ServerSubscriber, last ${tableName} in dexie:`, last)
  const lastUpdatedAt = last?.server_rev_at ?? fallbackRevAt
  // 1.2. subscribe for changes and update dexie with changes from subscription
  // TODO: catch errors
  // TODO: Error 413: Payload Too Large. See: https://github.com/supabase/realtime/issues/252
  supabase
    .from(tableName)
    // TODO: only subscribe to id for files, then fetch row with separate query?
    .on('*', (payload) => {
      console.log(`${tableName} subscription, payload:`, payload)
      const payloadErrors = payload.errors
      if (!payloadErrors) dexie.table(tableNameForDexie).put(payload.new)
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
  // 1.3. fetch all with newer last_updated_at
  let { data, error: error } = await supabase
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
  // 1.4. update dexie with these changes
  if (data) {
    // if files: need to convert files
    if (tableName === 'files') {
      data = data.map((d) => ({ ...d, file: d.file ? hex2buf(d.file) : null }))
    }
    try {
      await dexie.table(tableNameForDexie).bulkPut(data)
    } catch (error) {
      console.log(`error putting ${tableName}:`, error)
    }
  }
}

export default processTable
