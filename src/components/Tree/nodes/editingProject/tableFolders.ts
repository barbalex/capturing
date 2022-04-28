import buildRowNodes from './rowNodes'
import buildFieldNodes from './fieldNodes'
import isNodeOpen from '../../../../utils/isNodeOpen'

const tableFoldersEditingProject = async ({
  project,
  table,
  fieldId,
  rowId,
  pathname,
  nodes,
}) => {
  // return if parent does not exist (in nodes)
  if (
    !isNodeOpen({ nodes, url: ['projects', project.id, 'tables', table.id] })
  ) {
    return
  }

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
      isOpen: isNodeOpen({
        nodes,
        url: ['projects', project.id, 'tables', table.id, 'rows'],
      }),
      children: rowNodes,
      childrenCount: rowNodes.length,
    },
    {
      id: `${table.id}fieldsFolder`,
      label: 'Felder',
      type: 'fieldsFolder',
      object: table,
      activeNodeArray: ['projects', project.id, 'tables', table.id, 'fields'],
      isOpen: isNodeOpen({
        nodes,
        url: ['projects', project.id, 'tables', table.id, 'fields'],
      }),
      children: fieldNodes,
      childrenCount: fieldNodes.length,
    },
  ]

  return tableFolderNodes
}

export default tableFoldersEditingProject
