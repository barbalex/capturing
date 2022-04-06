import { supabase } from '../supabaseClient'
import { db as dexie } from '../dexieClient'
import { useLiveQuery } from 'dexie-react-hooks'

const SyncController = () => {
  // 1. TODO: Only progress if online
  // 2. get first (= oldest) queued update
  const queuedUpdates = useLiveQuery(async () => {
    return await dexie.queued_updates.orderBy('id').first()
  })
  console.log('SyncController, queuedUpdates:', queuedUpdates)
}

export default SyncController
