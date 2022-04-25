import buildRowNodes from './rowNodes'

const tableFoldersEditingProject = async ({
  project,
  table,
  fieldId,
  rowId,
  pathname,
}) => {
  const tableNodes = await buildRowNodes({
    table,
    rowId,
  })
  const tableFolderNodes = [
    {
      id: `${table.id}rowsFolder`,
      label: 'Datensätze',
      type: 'rowsFolder',
      object: table,
      activeNodeArray: ['projects', project.id, 'tables', table.id, 'rows'],
      isOpen: pathname.includes(`/projects/${project.id}/tables/${table.id}`),
      children: tableNodes,
      childrenCount: tableNodes.length,
    },
  ]

  return tableFolderNodes
}

export default tableFoldersEditingProject
