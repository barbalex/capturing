import { dexie, Table, QueuedUpdate } from '../dexieClient'

interface Props {
  projectId: string
}

const insertTable = async ({ projectId }: Props) => {
  const newTable = new Table(undefined, projectId)
  const update = new QueuedUpdate(
    undefined,
    undefined,
    'tables',
    undefined,
    JSON.stringify(newTable),
    undefined,
    undefined,
  )
  await Promise.all([
    dexie.ttables.put(newTable),
    dexie.queued_updates.add(update),
  ])
  return newTable.id
}

export default insertTable
