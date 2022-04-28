import { dexie } from '../../../../dexieClient'
import buildRowNodes from './rowNodes'
import buildFieldNodes from './fieldNodes'
import isNodeOpen from '../../../../utils/isNodeOpen'

const tableFoldersEditingProject = async ({
  project,
  table,
  fieldId,
  rowId,
  nodes,
}) => {
  // return if parent does not exist (in nodes)
  if (
    !isNodeOpen({ nodes, url: ['projects', project.id, 'tables', table.id] })
  ) {
    return
  }

  const rowNodes = await buildRowNodes({ project, table, rowId, nodes })
  const rowNodesLength = await dexie.rows
    .where({
      deleted: 0,
      table_id: table.id,
    })
    .count()
  const fieldNodes = await buildFieldNodes({ project, table, fieldId, nodes })
  const fieldNodesLength = await dexie.fields
    .where({
      deleted: 0,
      table_id: table.id,
    })
    .count()
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
      childrenCount: rowNodesLength,
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
      childrenCount: fieldNodesLength,
    },
  ]

  return tableFolderNodes
}

export default tableFoldersEditingProject
