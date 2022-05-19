import onMoveVectorLayers from './onMoveVectorLayers'
import onMoveTileLayers from './onMoveTileLayers'
import onMoveField from './onMoveField'

const onMove = async ({ idsMoved, folderDroppedIn, endIndex, rebuild }) => {
  console.log('onMove', { idsMoved, folderDroppedIn, endIndex })
  // do not know how multiple nodes can be mooved at once?
  const idMoved = idsMoved[0]
  if (folderDroppedIn.includes('vectorLayersFolder')) {
    await onMoveVectorLayers({ idMoved, folderDroppedIn, endIndex })
    rebuild()
  }
  if (folderDroppedIn.includes('tileLayersFolder')) {
    await onMoveTileLayers({ idMoved, folderDroppedIn, endIndex })
    rebuild()
  }
  if (folderDroppedIn.includes('fieldsFolder')) {
    await onMoveField({ idMoved, folderDroppedIn, endIndex })
    rebuild()
  }
}

export default onMove
