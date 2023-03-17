import { useContext, useEffect } from 'react'
import { dexie, QueuedUpdate } from '../dexieClient'
import { useLiveQuery } from 'dexie-react-hooks'
import { observer } from 'mobx-react-lite'

import storeContext from '../storeContext'
import processQueuedUpdate from '../utils/processQueuedUpdate'
import { IStore } from '../store'

const QueuedUpdatesWriter = () => {
  const store: IStore = useContext(storeContext)
  const { online } = store
  const queuedUpdates: QueuedUpdate[] = useLiveQuery(
    async () => await dexie.queued_updates.orderBy('id').toArray(),
  )
  useEffect(() => {
    const queuedUpdate: QueuedUpdate = (queuedUpdates ?? [])[0]
    // console.log('QueuedUpdatesWriter, queuedUpdate:', queuedUpdate)
    // Only progress if online
    if (!online) return
    if (!queuedUpdate) return

    processQueuedUpdate({ queuedUpdate, store })

    // Get this to restart when online status or queuedUpdates change
  }, [queuedUpdates, online, store])
}

export default observer(QueuedUpdatesWriter)
