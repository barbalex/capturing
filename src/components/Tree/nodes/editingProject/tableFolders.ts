import buildRowNodes from './rowNodes'
import buildFieldNodes from './fieldNodes'

const tableFoldersEditingProject = async ({
  project,
  table,
  fieldId,
  rowId,
  pathname,
  openNodes,
}) => {
  const rowNodes = await buildRowNodes({
    table,
    rowId,
  })
  const fieldNodes = await buildFieldNodes({ project, table, fieldId })
  const tableFolderNodes = [
    {
      id: `${table.id}rowsFolder`,
      label: 'Datensätze',
      type: 'rowsFolder',
      object: table,
      activeNodeArray: ['projects', project.id, 'tables', table.id, 'rows'],
      isOpen: pathname.includes(`/projects/${project.id}/tables/${table.id}`),
      children: rowNodes,
      childrenCount: rowNodes.length,
    },
    {
      id: `${table.id}fieldsFolder`,
      label: 'Felder',
      type: 'fieldsFolder',
      object: table,
      activeNodeArray: ['projects', project.id, 'tables', table.id, 'fields'],
      isOpen: pathname.includes(`/projects/${project.id}/tables/${table.id}`),
      children: fieldNodes,
      childrenCount: fieldNodes.length,
    },
  ]

  return tableFolderNodes
}

export default tableFoldersEditingProject
