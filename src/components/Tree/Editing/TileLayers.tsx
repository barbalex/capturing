import { useLiveQuery } from 'dexie-react-hooks'

import { dexie, Project, TileLayer } from '../../../dexieClient'
import Node from '../Node'
import { TreeNode } from '../Viewing'

const TileLayers = ({ project }: { project: Project }) => {
  const tileLayers: TileLayer[] | undefined = useLiveQuery(() =>
    dexie.tile_layers
      .where({
        deleted: 0,
        project_id: project.id,
      })
      .sortBy('sort'),
  )

  if (!tileLayers) return null

  return tileLayers.map((tileLayer) => {
    const url = ['projects', project.id, 'tile-layers', tileLayer.id]

    const node: TreeNode = {
      id: tileLayer.id,
      label: tileLayer.label ?? '(ohne Beschriftung)',
      type: 'tile_layer',
      object: tileLayer,
      url,
      childrenCount: 0,
      projectId: project.id,
    }

    return <Node key={tileLayer.id} node={node} />
  })
}

export default TileLayers
