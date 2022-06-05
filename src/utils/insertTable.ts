import { dexie, Table, QueuedUpdate } from '../dexieClient'

type InsertTableProps = {
  projectId: string
}

const insertTable = async ({ projectId }: InsertTableProps) => {
  const newTable = new Table(undefined, projectId)
  const update = new QueuedUpdate(
    undefined,
    undefined,
    'tables',
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
