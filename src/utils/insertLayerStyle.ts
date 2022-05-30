import { dexie, LayerStyle, QueuedUpdate } from '../dexieClient'

type Props = {
  tableId: string
  projectVectorLayerId: string
}

const insertLayerStyle = async ({ tableId, projectVectorLayerId }: Props) => {
  const newLayerStyle = new LayerStyle(undefined, tableId, projectVectorLayerId)
  const update = new QueuedUpdate(
    undefined,
    undefined,
    'layer_styles',
    JSON.stringify(newLayerStyle),
    undefined,
    undefined,
  )
  // console.log('insertLayerStyle, will insert:', newLayerStyle)
  try {
    await Promise.all([
      dexie.layer_styles.put(newLayerStyle),
      dexie.queued_updates.add(update),
    ])
  } catch (error) {
    console.log(
      'insertLayerStyle, error putting layer_styles and adding queued_updates:',
      error.message,
    )
  }
  // console.log('insertLayerStyle, id:', newLayerStyle.id)
  return newLayerStyle
}

export default insertLayerStyle
