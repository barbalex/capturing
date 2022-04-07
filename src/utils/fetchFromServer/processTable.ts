import { supabase } from '../../supabaseClient'
import { db as dexie, IProject } from '../../dexieClient'

const processTable = async ({ subscriptionErrorCallback, tableName }) => {
  // 1. projects
  // 1.1. get last_updated_at from dexie
  const last = await dexie
    .table(tableName)
    .orderBy('server_rev_at')
    .reverse()
    .first()
  console.log(`ServerSubscriber, last ${tableName} in dexie:`, last)
  const lastUpdatedAt = last?.server_rev_at ?? fallbackRevAt
  // 1.2. subscribe for changes and update dexie with changes from subscription
  supabase
    .from(tableName)
    .on('*', (payload) => {
      console.log(`${tableName} subscription, payload:`, payload)
      dexie.table(tableName).put(payload.new)
    })
    .subscribe((status) => {
      console.log(`${tableName} subscription, status:`, status)
      if (subscriptionErrorCallback && status === 'SUBSCRIPTION_ERROR') {
        if (document.visibilityState === 'hidden') {
          // page visible so let realtime reconnect and reload data
          supabase.removeAllSubscriptions()
          hiddenError = true
        }
      }
    })
  // 1.3. fetch all with newer last_updated_at
  const { data, error: error } = await supabase
    .from(tableName)
    .select('*')
    .gte('server_rev_at', lastUpdatedAt)
  if (error) {
    console.log(
      `ServerSubscriber, error fetching ${tableName} from supabase:`,
      error,
    )
  }
  console.log(
    `ServerSubscriber, last ${tableName} fetched from supabase:`,
    data,
  )
  // 1.4. update dexie with these changes
  if (data) {
    try {
      await dexie.table(tableName).bulkPut(data)
    } catch (error) {
      console.log(`error putting ${tableName}:`, error)
    }
  }
}

export default processTable
