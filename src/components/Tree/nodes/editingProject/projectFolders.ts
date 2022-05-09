import buildTableNodes from './tableNodes'
import buildTileLayerNodes from './tileLayerNodes'
import buildVectorLayerNodes from './vectorLayerNodes'
import { dexie } from '../../../../dexieClient'
import isNodeOpen from '../../../../utils/isNodeOpen'

const projectFoldersEditingProject = async ({
  project,
  tableId,
  fieldId,
  rowId,
  nodes,
}) => {
  // return if parent does not exist (in nodes)
  if (!isNodeOpen({ nodes, url: ['projects', project.id] })) return

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
        fieldId,
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
      childrenCount: await dexie.project_tile_layers
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
      childrenCount: await dexie.project_vector_layers
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
