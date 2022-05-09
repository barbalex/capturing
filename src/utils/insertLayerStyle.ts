import { dexie, LayerStyle, QueuedUpdate } from '../dexieClient'

type Props = {
  tableId: string
  projectTileLayerId: string
  projectVectorLayerId: string
}

const insertLayerStyle = async ({
  tableId,
  projectTileLayerId,
  projectVectorLayerId,
}: Props) => {
  const newLayerStyle = new LayerStyle(
    undefined,
    tableId,
    projectTileLayerId,
    projectVectorLayerId,
  )
  const update = new QueuedUpdate(
    undefined,
    undefined,
    'layer_styles',
    JSON.stringify(newLayerStyle),
    undefined,
    undefined,
  )
  await Promise.all([
    dexie.layer_styles.put(newLayerStyle),
    dexie.queued_updates.add(update),
  ])
  return newLayerStyle.id
}

export default insertLayerStyle
