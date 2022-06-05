import { dexie } from '../../../../dexieClient'
import buildRowNodes from './rowNodes'
import buildFieldNodes from './fieldNodes'
import isNodeOpen from '../../../../utils/isNodeOpen'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'

const tableFoldersEditingProject = async ({ project, table, rowId, nodes }) => {
  // return if parent does not exist (in nodes)

  if (
    !isNodeOpen({ nodes, url: ['projects', project.id, 'tables', table.id] })
  ) {
    return
  }

  const tableFolderNodes = [
    {
      id: `${table.id}/rowsFolder`,
      label: labelFromLabeledTable({
        object: table,
        useLabels: project.use_labels,
      }),
      type: 'rowsFolder',
      object: table,
      activeNodeArray: ['projects', project.id, 'tables', table.id, 'rows'],
      isOpen: isNodeOpen({
        nodes,
        url: ['projects', project.id, 'tables', table.id, 'rows'],
      }),
      children: await buildRowNodes({ project, table, rowId, nodes }),
      childrenCount: await dexie.rows
        .where({
          deleted: 0,
          table_id: table.id,
        })
        .count(),
    },
    {
      id: `${table.id}/fieldsFolder`,
      label: 'Felder',
      type: 'fieldsFolder',
      object: table,
      activeNodeArray: ['projects', project.id, 'tables', table.id, 'fields'],
      isOpen: isNodeOpen({
        nodes,
        url: ['projects', project.id, 'tables', table.id, 'fields'],
      }),
      children: await buildFieldNodes({ project, table, nodes }),
      childrenCount: await dexie.fields
        .where({
          deleted: 0,
          table_id: table.id,
        })
        .count(),
    },
  ]

  return tableFolderNodes
}

export default tableFoldersEditingProject
