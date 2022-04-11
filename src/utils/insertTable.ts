import { dexie, Table, IProject, QueuedUpdate } from '../dexieClient'

type InsertTableProps = {
  project: IProject
}

const insertTable = async ({ project }: InsertTableProps) => {
  const newTable = new Table(
    undefined,
    project.id,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  )
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
