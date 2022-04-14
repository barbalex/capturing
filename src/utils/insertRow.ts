import { dexie, Row, QueuedUpdate } from '../dexieClient'

type InsertRowProps = {
  tableId: string
}

const insertRow = async ({ tableId }: InsertRowProps) => {
  const newRow = new Row(
    undefined,
    tableId,
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
    undefined,
    undefined,
    undefined,
  )
  const update = new QueuedUpdate(
    undefined,
    undefined,
    'rows',
    JSON.stringify(newRow),
    undefined,
    undefined,
  )
  await Promise.all([dexie.rows.put(newRow), dexie.queued_updates.add(update)])
  return newRow.id
}

export default insertRow
