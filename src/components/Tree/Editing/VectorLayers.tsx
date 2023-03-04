import { useLiveQuery } from 'dexie-react-hooks'

import { dexie, VectorLayer } from '../../../dexieClient'
import Node from '../Node'

const VectorLayers = ({ project }) => {
  const vectorLayers: VectorLayer[] = useLiveQuery(() =>
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

    const node = {
      id: vectorLayer.id,
      label: vectorLayer.label ?? '(ohne Beschriftung)',
      type: 'vector_layer',
      object: vectorLayer,
      url,
      childrenCount: 0,
    }

    return <Node key={vectorLayer.id} node={node} />
  })
}

export default VectorLayers
