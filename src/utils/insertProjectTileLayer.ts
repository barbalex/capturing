import { dexie, ProjectTileLayer, QueuedUpdate } from '../dexieClient'

type Props = {
  projectId: string
}

const insertProjectTileLayer = async ({ projectId }: Props) => {
  const newProjectTileLayer = new ProjectTileLayer(
    undefined,
    undefined,
    0,
    0,
    projectId,
    'url_template',
    undefined,
    undefined,
    19,
    0,
    1,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    0,
    undefined,
    0,
    undefined,
    undefined,
    0,
  )
  const update = new QueuedUpdate(
    undefined,
    undefined,
    'project_tile_layers',
    JSON.stringify(newProjectTileLayer),
    undefined,
    undefined,
  )
  await Promise.all([
    dexie.project_tile_layers.put(newProjectTileLayer),
    dexie.queued_updates.add(update),
  ])
  return newProjectTileLayer.id
}

export default insertProjectTileLayer
