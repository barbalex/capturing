import { dexie, File, QueuedUpdate } from '../dexieClient'

type Props = {
  file: blob
}

const insertFile = async ({ file }: Props) => {
  const newRow = new File(undefined, file)
  const update = new QueuedUpdate(
    undefined,
    undefined,
    'file',
    JSON.stringify(newRow),
    undefined,
    undefined,
  )
  await Promise.all([dexie.files.put(newRow), dexie.queued_updates.add(update)])
  return newRow.id
}

export default insertFile
