import { useContext, useEffect } from 'react'
import { db as dexie, QueuedUpdate } from '../dexieClient'
import { useLiveQuery } from 'dexie-react-hooks'

import storeContext from '../storeContext'
import processQueuedUpdate from '../utils/processQueuedUpdate'

const QueuedUpdatesWriter = () => {
  const store = useContext(storeContext)
  const { online } = store
  // const { session } = store
  // console.log('SyncController, session:', session)

  // 1. TODO: Only progress if online
  // 2. TODO: Get this to restart when online status changes or queuedUpdates.length changes (useEffect with offline status and queuedUpdates in [])
  const queuedUpdates: QueuedUpdate[] = useLiveQuery(async () => {
    return await dexie.queued_updates.orderBy('id').first()
  })
  useEffect(() => {
    const queuedUpdate: QueuedUpdate = (queuedUpdates ?? [])[0]
    if (!queuedUpdate) return

    processQueuedUpdate({ queuedUpdate, store })
  }, [queuedUpdates, online, store])
}

export default QueuedUpdatesWriter