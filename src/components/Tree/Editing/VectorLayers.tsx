import { useLiveQuery } from 'dexie-react-hooks'

import { dexie, Project, VectorLayer } from '../../../dexieClient'
import Node from '../Node'
import { TreeNode } from '../Viewing'

const VectorLayers = ({ project }: { project: Project }) => {
  const vectorLayers: VectorLayer[] | undefined = useLiveQuery(() =>
    dexie.vector_layers
      .where({
        deleted: 0,
        project_id: project.id,
      })
      .sortBy('sort'),
  )

  if (!vectorLayers) return null

  return vectorLayers.map((vectorLayer) => {
    const url = ['projects', project.id, 'vector-layers', vectorLayer.id]

    const node: TreeNode = {
      id: vectorLayer.id,
      label: vectorLayer.label ?? '(ohne Beschriftung)',
      type: 'vector_layer',
      object: vectorLayer,
      url,
      childrenCount: 0,
      projectId: project.id,
    }

    return <Node key={vectorLayer.id} node={node} />
  })
}

export default VectorLayers
