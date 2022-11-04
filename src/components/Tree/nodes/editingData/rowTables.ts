import { Table } from '../../../../dexieClient'
import sortByLabelName from '../../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'
import isNodeOpen from '../../../../utils/isNodeOpen'
import rowTableRowNodes from './rowTableRows'

const rowTableNodesEditingProject = async ({
  project,
  table,
  row,
  tables,
  nodes,
  tableId,
  tableId2,
  rowId,
  rowId2,
}) => {
  // return if parent does not exist (in nodes)
  if (
    !isNodeOpen({
      nodes,
      url: ['projects', project.id, 'tables', table.id, 'rows', row.id],
    })
  )
    return []

  const tablesSorted = sortByLabelName({
    objects: tables,
    useLabels: project.use_labels,
  })

  const tableNodes = []
  for (const table2: Table of tablesSorted) {
    const ownActiveNodeArray = [
      'projects',
      project.id,
      'tables',
      table.id,
      'rows',
      row.id,
      'tables',
      table2.id,
      'rows',
    ]

    const children = await rowTableRowNodes({
      project,
      table,
      row,
      table2,
      tableId,
      tableId2,
      rowId,
      rowId2,
    })

    const node = {
      id: `${table2.id}/2`,
      label: labelFromLabeledTable({
        object: table2,
        useLabels: project.use_labels,
      }),
      type: 'table',
      object: table2,
      activeNodeArray: ownActiveNodeArray,
      isOpen: isNodeOpen({
        nodes,
        url: ownActiveNodeArray,
      }),
      children,
      childrenCount: children.length,
    }
    tableNodes.push(node)
  }

  return tableNodes
}

export default rowTableNodesEditingProject
