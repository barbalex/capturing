import { dexie, VectorLayer } from '../../../../dexieClient'
import isNodeOpen from '../../../../utils/isNodeOpen'

const vectorLayerNodesEditingProject = async ({ project, nodes }) => {
  // return if parent does not exist (in nodes)
  if (!isNodeOpen({ nodes, url: ['projects', project.id, 'vector-layers'] }))
    return

  const vectorLayers: VectorLayer[] = await dexie.vector_layers
    .where({
      deleted: 0,
      project_id: project.id,
    })
    .sortBy('sort')

  const vectorLayerNodes = []
  for (const vectorLayer of vectorLayers) {
    const ownActiveNodeArray = [
      'projects',
      project.id,
      'vector-layers',
      vectorLayer.id,
    ]

    const node = {
      id: vectorLayer.id,
      label: vectorLayer.label ?? '(ohne Beschriftung)',
      type: 'project_vector_layer',
      object: vectorLayer,
      activeNodeArray: ownActiveNodeArray,
      isOpen: isNodeOpen({
        nodes,
        url: ownActiveNodeArray,
      }),
      children: [],
      childrenCount: 0,
    }
    vectorLayerNodes.push(node)
  }

  return vectorLayerNodes
}

export default vectorLayerNodesEditingProject
