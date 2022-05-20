import { Session } from '@supabase/supabase-js'

import { dexie, TileVectorLayer } from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'

const onMoveTileLayers = async ({ idMoved, folderDroppedIn, endIndex }) => {
  const session: Session = supabase.auth.session()

  const urlArray = folderDroppedIn.split('/')
  const projectId = urlArray[0]

  // 1. get list
  const tileVectorLayers: TileVectorLayer[] = await dexie.project_tile_layers
    .where({ deleted: 0, project_id: projectId })
    .sortBy('sort')
  // 2. get index of dragged pvl
  const startIndex = tileVectorLayers.findIndex((pvl) => pvl.id === idMoved)
  // 3. return if moved node was not pvl
  if (startIndex === undefined) return
  // 4. re-order array
  const result = Array.from(tileVectorLayers)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  // 5. set sort value according to index in list if it has changed
  const tileVectorLayersToUpdate = []
  for (const [index, res] of result.entries()) {
    const sort = index + 1
    const tileVectorLayer = tileVectorLayers.find((ptl) => ptl.id === res.id)
    if (tileVectorLayer.sort !== sort) {
      // update sort value
      const was = { ...tileVectorLayer }
      const is = { ...tileVectorLayer, sort }
      tileVectorLayersToUpdate.push(is)
      tileVectorLayer.updateOnServer({
        was,
        is,
        session,
      })
    }
  }
  // push in bulk to reduce re-renders via liveQuery
  await dexie.project_tile_layers.bulkPut(tileVectorLayersToUpdate)
  return
}

export default onMoveTileLayers