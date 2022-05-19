import { Session } from '@supabase/supabase-js'

import { dexie, ProjectVectorLayer } from '../../dexieClient'
import { supabase } from '../../supabaseClient'

const onMove = async ({ idsMoved, folderDroppedIn, endIndex, rebuild }) => {
  const session: Session = supabase.auth.session()
  // do not know how multiple nodes can be mooved at once?
  const idMoved = idsMoved[0]
  if (folderDroppedIn.includes('vectorLayersFolder')) {
    const urlArray = folderDroppedIn.split('/')
    const projectId = urlArray[0]
    // sort vector layers
    // 1. get list
    const projectVectorLayers: ProjectVectorLayer[] =
      await dexie.project_vector_layers
        .where({ deleted: 0, project_id: projectId })
        .sortBy('sort')
    // 2. get index of dragged pvl
    const startIndex = projectVectorLayers.findIndex(
      (pvl) => pvl.id === idMoved,
    )
    // 3. return if moved node was not pvl
    if (startIndex === undefined) return
    console.log('TreeComponent, onMove, startIndex:', startIndex)
    // 4. re-order array
    const result = Array.from(projectVectorLayers)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    /**
     * 5. set sort value according to index in list
     *    if it has changed
     */
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
    rebuild()
  }
}

export default onMove
