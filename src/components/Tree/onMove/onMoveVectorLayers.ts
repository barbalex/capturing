import { Session } from '@supabase/supabase-js'

import { dexie, ProjectVectorLayer } from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'

const onMoveVectorLayers = async ({ idMoved, folderDroppedIn, endIndex }) => {
  const session: Session = supabase.auth.session()

  const urlArray = folderDroppedIn.split('/')
  const projectId = urlArray[0]

  // 1. get list
  const projectVectorLayers: ProjectVectorLayer[] =
    await dexie.project_vector_layers
      .where({ deleted: 0, project_id: projectId })
      .sortBy('sort')
  // 2. get index of dragged pvl
  const startIndex = projectVectorLayers.findIndex((pvl) => pvl.id === idMoved)
  // 3. return if moved node was not pvl
  if (startIndex === undefined) return
  // 4. re-order array
  const result = Array.from(projectVectorLayers)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  // 5. set sort value according to index in list if it has changed
  const projectVectorLayersToUpdate = []
  for (const [index, res] of result.entries()) {
    const sort = index + 1
    const projectVectorLayer = projectVectorLayers.find(
      (ptl) => ptl.id === res.id,
    )
    if (projectVectorLayer.sort !== sort) {
      // update sort value
      const was = { ...projectVectorLayer }
      const is = { ...projectVectorLayer, sort }
      projectVectorLayersToUpdate.push(is)
      projectVectorLayer.updateOnServer({
        was,
        is,
        session,
      })
    }
  }
  // push in bulk to reduce re-renders via liveQuery
  await dexie.project_vector_layers.bulkPut(projectVectorLayersToUpdate)
  return
}

export default onMoveVectorLayers
