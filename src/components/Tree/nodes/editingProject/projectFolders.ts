import buildTableNodes from './tables'
import buildTileLayerNodes from './tileLayers'
import buildVectorLayerNodes from './vectorLayers'
import { dexie } from '../../../../dexieClient'
import isNodeOpen from '../../isNodeOpen'

const projectFoldersEditingProject = async ({ project, rowId, nodes }) => {
  // return if parent does not exist (in nodes)
  if (!isNodeOpen({ nodes, url: ['projects', project.id] })) return []

  const folderNodes = [
    {
      id: `${project.id}/tablesFolder`,
      label: 'Tabellen',
      type: 'projectFolder',
      object: project,
      activeNodeArray: ['projects', project.id, 'tables'],
      isOpen: isNodeOpen({ nodes, url: ['projects', project.id, 'tables'] }),
      children: await buildTableNodes({
        project,
        rowId,
        nodes,
      }),
      childrenCount: await dexie.ttables
        .where({
          deleted: 0,
          project_id: project.id,
        })
        .count(),
    },
    {
      id: `${project.id}/tileLayersFolder`,
      label: 'Bild-Karten',
      type: 'tileLayerFolder',
      object: project,
      activeNodeArray: ['projects', project.id, 'tile-layers'],
      isOpen: isNodeOpen({
        nodes,
        url: ['projects', project.id, 'tile-layers'],
      }),
      children: await buildTileLayerNodes({
        project,
        nodes,
      }),
      childrenCount: await dexie.tile_layers
        .where({
          deleted: 0,
          project_id: project.id,
        })
        .count(),
    },
    {
      id: `${project.id}/vectorLayersFolder`,
      label: 'Vektor-Karten',
      type: 'vectorLayerFolder',
      object: project,
      activeNodeArray: ['projects', project.id, 'vector-layers'],
      isOpen: isNodeOpen({
        nodes,
        url: ['projects', project.id, 'vector-layers'],
      }),
      children: await buildVectorLayerNodes({
        project,
        nodes,
      }),
      childrenCount: await dexie.vector_layers
        .where({
          deleted: 0,
          project_id: project.id,
        })
        .count(),
    },
  ]

  return folderNodes
}

export default projectFoldersEditingProject
