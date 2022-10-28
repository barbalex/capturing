import { dexie, VectorLayer } from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'

const onMoveVectorLayers = async ({ idMoved, folderDroppedIn, endIndex }) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const urlArray = folderDroppedIn.split('/')
  const projectId = urlArray[0]

  // 1. get list
  const vectorLayers: VectorLayer[] = await dexie.vector_layers
    .where({ deleted: 0, project_id: projectId })
    .sortBy('sort')
  // 2. get index of dragged pvl
  const startIndex = vectorLayers.findIndex((pvl) => pvl.id === idMoved)
  // 3. return if moved node was not pvl
  if (startIndex === undefined) return
  // 4. re-order array
  const result = Array.from(vectorLayers)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  // 5. set sort value according to index in list if it has changed
  const vectorLayersToUpdate = []
  for (const [index, res] of result.entries()) {
    const sort = index + 1
    const vectorLayer = vectorLayers.find((vl) => vl.id === res.id)
    if (vectorLayer.sort !== sort) {
      // update sort value
      const was = { ...vectorLayer }
      const is = { ...vectorLayer, sort }
      vectorLayersToUpdate.push(is)
      vectorLayer.updateOnServer({
        was,
        is,
        session,
      })
    }
  }
  // push in bulk to reduce re-renders via liveQuery
  await dexie.vector_layers.bulkPut(vectorLayersToUpdate)
  return
}

export default onMoveVectorLayers
