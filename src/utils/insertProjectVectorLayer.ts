import { dexie, ProjectVectorLayer, QueuedUpdate } from '../dexieClient'

type Props = {
  projectId: string
}

const insertProjectVectorLayer = async ({ projectId }: Props) => {
  const newProjectVectorLayer = new ProjectVectorLayer(
    undefined,
    undefined,
    0,
    0,
    projectId,
    undefined,
    19,
    0,
    undefined,
    undefined,
    undefined,
    1,
    0,
    undefined,
    undefined,
    undefined,
    0,
  )
  const update = new QueuedUpdate(
    undefined,
    undefined,
    'project_vector_layers',
    JSON.stringify(newProjectVectorLayer),
    undefined,
    undefined,
  )
  await Promise.all([
    dexie.project_vector_layers.put(newProjectVectorLayer),
    dexie.queued_updates.add(update),
  ])
  return newProjectVectorLayer.id
}

export default insertProjectVectorLayer
