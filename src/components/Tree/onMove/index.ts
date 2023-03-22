// not used any more since rebuilding tree from components
import onMoveVectorLayers from './onMoveVectorLayers'
import onMoveTileLayers from './onMoveTileLayers'
import onMoveField from './onMoveField'

const onMove = async ({ idsMoved, folderDroppedIn, endIndex, rebuildTree }) => {
  // do not know how multiple nodes can be mooved at once?
  const idMoved = idsMoved[0]
  if (folderDroppedIn.includes('vectorLayersFolder')) {
    await onMoveVectorLayers({ idMoved, folderDroppedIn, endIndex })
    rebuildTree()
  }
  if (folderDroppedIn.includes('tileLayersFolder')) {
    await onMoveTileLayers({ idMoved, folderDroppedIn, endIndex })
    rebuildTree()
  }
  if (folderDroppedIn.includes('fieldsFolder')) {
    await onMoveField({ idMoved, folderDroppedIn, endIndex })
    rebuildTree()
  }
}

export default onMove
