import { dexie, Table } from '../../../../dexieClient'
import sortByLabelName from '../../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'
import isNodeOpen from '../../../../utils/isNodeOpen'
import buildFolders from './tableFolders'

const tableNodesEditingProject = async ({ project, rowId, nodes }) => {
  // return if parent does not exist (in nodes)
  if (!isNodeOpen({ nodes, url: ['projects', project.id, 'tables'] })) return

  const tables = await dexie.ttables
    .where({
      deleted: 0,
      project_id: project.id,
    })
    .toArray()
  const tablesSorted = sortByLabelName({
    objects: tables,
    useLabels: project.use_labels,
  })

  const tableNodes = []
  for (const table: Table of tablesSorted) {
    const ownActiveNodeArray = ['projects', project.id, 'tables', table.id]

    const node = {
      id: table.id,
      label: labelFromLabeledTable({
        object: table,
        useLabels: project.use_labels,
      }),
      type: 'table',
      object: table,
      activeNodeArray: ownActiveNodeArray,
      isOpen: isNodeOpen({
        nodes,
        url: ownActiveNodeArray,
      }),
      children: await buildFolders({
        project,
        table,
        rowId,
        nodes,
      }),
      childrenCount: await dexie.rows
        .where({ deleted: 0, table_id: table.id })
        .count(),
    }
    tableNodes.push(node)
  }

  return tableNodes
}

export default tableNodesEditingProject
