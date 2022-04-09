import { useContext } from 'react'
import { supabase } from '../supabaseClient'
import { db as dexie, QueuedUpdate } from '../dexieClient'
import { useLiveQuery } from 'dexie-react-hooks'
import { v1 as uuidv1 } from 'uuid'

import storeContext from '../storeContext'

const revTables = ['rows', 'files']

const QueuedUpdatesWriter = () => {
  const store = useContext(storeContext)
  const { session } = store
  console.log('SyncController, session:', session)
  // 1. TODO: Only progress if online
  // 2. TODO: Get this to restart when back online (useEffect with offline status in [])
  const queuedUpdates: QueuedUpdate[] = useLiveQuery(async () => {
    return await dexie.queued_updates.orderBy('id').toArray()
  })
  if (!queuedUpdates) return
  console.log('SyncController, queuedUpdates:', queuedUpdates)
  queuedUpdates.forEach((u) => {
    // TODO: ttables problem?
    const isRevTable = revTables.includes(u.table)
    const singularTableName = u.table.slice(0, -1)
    // 1. insert  _rev or upsert regular table
    if (isRevTable) {
      // https://stackoverflow.com/a/36630251/712005
      const revTableName = u.table.replace(/.$/, '_rev')
      // TODO: insert revision
      // 1 create revision
      const newObject = JSON.parse(u.value)
      const id = newObject.id
      delete newObject.id
      const newRevObject = {
        [`${singularTableName}_id`]: id,
        ...newObject,
        client_rev_at: new window.Date().toISOString(),
        client_rev_by: session.user.email,
      }
      //supabase.from(u.table).insert()
    } else {
      // TODO: upsert table
    }
  })
}

export default QueuedUpdatesWriter
