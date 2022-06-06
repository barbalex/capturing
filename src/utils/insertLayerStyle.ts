import { dexie, LayerStyle, QueuedUpdate } from '../dexieClient'

type Props = {
  tableId: string
  vectorLayerId: string
}

const insertLayerStyle = async ({ tableId, vectorLayerId }: Props) => { 
  const newLayerStyle = new LayerStyle(undefined, tableId, vectorLayerId)
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
    console.error(
      'insertLayerStyle, error putting layer_styles and adding queued_updates:',
      error.message,
    )
  }
  // console.log('insertLayerStyle, id:', newLayerStyle.id)
  return newLayerStyle
}

export default insertLayerStyle
