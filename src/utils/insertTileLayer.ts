import { dexie, TileLayer, QueuedUpdate } from '../dexieClient'

interface Props {
  projectId: string
}

const insertTileLayer = async ({ projectId }: Props) => {
  const newTileLayer = new TileLayer(
    undefined,
    undefined,
    0,
    1, // set it active so user can check if it works
    projectId,
    'wms',
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
    1,
    undefined,
    0,
    undefined,
    undefined,
    0,
  )
  const update = new QueuedUpdate(
    undefined,
    undefined,
    'tile_layers',
    JSON.stringify(newTileLayer),
    undefined,
    undefined,
  )
  await Promise.all([
    dexie.tile_layers.put(newTileLayer),
    dexie.queued_updates.add(update),
  ])
  return newTileLayer.id
}

export default insertTileLayer
