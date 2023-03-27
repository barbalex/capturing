import { useContext, useEffect } from 'react'
import { dexie, QueuedUpdate } from '../dexieClient'
import { useLiveQuery } from 'dexie-react-hooks'
import { observer } from 'mobx-react-lite'

import storeContext from '../storeContext'
import processQueuedUpdate from '../utils/processQueuedUpdate'
import { IStore } from '../store'
import { tables } from '../dexieClient'

const QueuedUpdatesWriter = () => {
  const store: IStore = useContext(storeContext)
  const { online } = store
  const queuedUpdates: QueuedUpdate[] | undefined = useLiveQuery(
    async () =>
      await dexie.queued_updates.where('table').anyOf(tables).sortBy('id'),
    // .orderBy('id'),
    // .toArray(),
  )
  useEffect(() => {
    const queuedUpdate = (queuedUpdates ?? [])[0]
    // console.log('QueuedUpdatesWriter, queuedUpdate:', queuedUpdate)
    // Only progress if online
    if (!online) return
    if (!queuedUpdate) return

    // TODO: re-activate (goot to test queued updates form)
    processQueuedUpdate({ queuedUpdate, store })

    // Get this to restart when online status or queuedUpdates change
  }, [queuedUpdates, online, store])
}

export default observer(QueuedUpdatesWriter)
