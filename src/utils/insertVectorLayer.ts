import { dexie, VectorLayer, QueuedUpdate } from '../dexieClient'

type Props = {
  projectId: string
}

const insertVectorLayer = async ({ projectId }: Props) => {
  const newVectorLayer = new VectorLayer(
    undefined,
    undefined,
    0,
    0,
    projectId,
    'wfs',
    undefined,
    19,
    0,
    1,
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
    0,
  )
  const update = new QueuedUpdate(
    undefined,
    undefined,
    'vector_layers',
    JSON.stringify(newVectorLayer),
    undefined,
    undefined,
  )
  await Promise.all([
    dexie.vector_layers.put(newVectorLayer),
    dexie.queued_updates.add(update),
  ])
  return newVectorLayer.id
}

export default insertVectorLayer
