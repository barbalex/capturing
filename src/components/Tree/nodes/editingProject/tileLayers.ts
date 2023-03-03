import { dexie, TileLayer } from '../../../../dexieClient'
import isNodeOpen from '../../isNodeOpen'

const tileLayerNodesEditingProject = async ({ project, nodes }) => {
  // return if parent does not exist (in nodes)
  if (!isNodeOpen({ nodes, url: ['projects', project.id, 'tile-layers'] }))
    return

  const tileLayers: TileLayer[] = await dexie.tile_layers
    .where({
      deleted: 0,
      project_id: project.id,
    })
    .sortBy('sort')

  const tileLayerNodes = []
  for (const tileLayer of tileLayers) {
    const ownActiveNodeArray = [
      'projects',
      project.id,
      'tile-layers',
      tileLayer.id,
    ]

    const node = {
      id: tileLayer.id,
      label: tileLayer.label ?? '(ohne Beschriftung)',
      type: 'tile_layer',
      object: tileLayer,
      activeNodeArray: ownActiveNodeArray,
      isOpen: isNodeOpen({
        nodes,
        url: ownActiveNodeArray,
      }),
      children: [],
      childrenCount: 0,
    }
    tileLayerNodes.push(node)
  }

  return tileLayerNodes
}

export default tileLayerNodesEditingProject
