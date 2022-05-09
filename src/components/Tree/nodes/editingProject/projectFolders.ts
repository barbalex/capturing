import buildTableNodes from './tableNodes'
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

  const tileLayerNodes = []
  // TODO: query tile layers and build their nodes
  const vectorLayerNodes = []
  // TODO: query vector layers and build their nodes

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
        tableId,
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
      children: tileLayerNodes,
      childrenCount: tileLayerNodes.length,
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
      children: vectorLayerNodes,
      childrenCount: vectorLayerNodes.length,
    },
  ]

  return folderNodes
}

export default projectFoldersEditingProject
