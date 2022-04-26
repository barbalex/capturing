import buildTableNodes from './tableNodes'
import { dexie } from '../../../../dexieClient'

const projectFoldersEditingProject = async ({
  project,
  tableId,
  fieldId,
  rowId,
  pathname,
  nodes,
}) => {
  const tableNodesCount = await dexie.ttables
    .where({
      deleted: 0,
      project_id: project.id,
    })
    .count()
  const tableNodes = await buildTableNodes({
    project,
    tableId,
    fieldId,
    rowId,
    pathname,
    nodes,
  })

  const tileLayerNodes = []
  // TODO: query tile layers and build their nodes

  const folderNodes = [
    {
      id: `${project.id}/tablesFolder`,
      label: 'Tabellen',
      type: 'projectFolder',
      object: project,
      activeNodeArray: ['projects', project.id, 'tables'],
      isOpen: pathname.includes(`/projects/${project.id}/tables`),
      children: tableNodes,
      childrenCount: tableNodesCount,
    },
    {
      id: `${project.id}/tileLayersFolder`,
      label: 'Hintergrund-Karten',
      type: 'tileLayerFolder',
      object: project,
      activeNodeArray: ['projects', project.id, 'tile-layers'],
      isOpen: pathname.includes(`/projects/${project.id}/tile-layers`),
      children: tileLayerNodes,
      childrenCount: tileLayerNodes.length,
    },
  ]
  return folderNodes
}

export default projectFoldersEditingProject
