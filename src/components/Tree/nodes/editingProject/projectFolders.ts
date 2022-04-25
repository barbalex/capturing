import buildTableNodes from './tableNodes'

const projectFoldersEditingProject = async ({
  project,
  tableId,
  fieldId,
  rowId,
  pathname,
  openNodes,
}) => {
  const tableNodes = await buildTableNodes({
    project,
    tableId,
    fieldId,
    rowId,
    pathname,
    openNodes,
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
      childrenCount: tableNodes.length,
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
