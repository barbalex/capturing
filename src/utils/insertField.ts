import { dexie, Field, QueuedUpdate } from '../dexieClient'

interface Props {
  tableId: string
}

const insertField = async ({ tableId }: Props) => {
  const newField = new Field(undefined, tableId)
  const update = new QueuedUpdate(
    undefined,
    undefined,
    'fields',
    JSON.stringify(newField),
    undefined,
    undefined,
  )
  await Promise.all([
    dexie.fields.put(newField),
    dexie.queued_updates.add(update),
  ])
  return newField.id
}

export default insertField
