import isEqual from 'lodash/isEqual'

import { dexie, Table } from '../../../../dexieClient'
import sortByLabelName from '../../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'
import isNodeOpen from '../../../../utils/isNodeOpen'
import rowNodes from './rowNodes'

const tableNodesEditingData = async ({
  project,
  tableId,
  rowId,
  openNodes,
  addOpenNodes,
}) => {
  // return if parent is not open (in openNodes)
  if (!isNodeOpen({ openNodes, url: ['projects', project.id] })) return

  const tables = await dexie.ttables
    .where({
      deleted: 0,
      project_id: project.id,
      type: 'standard',
    })
    .toArray()
  const tablesSorted = sortByLabelName({
    objects: tables,
    useLabels: project.use_labels,
  })

  const tableNodes = []
  for (const table: Table of tablesSorted) {
    const parentActiveNodeArray = ['projects', table.project_id, 'tables']
    const parentIsOpen =
      openNodes.filter((n) => isEqual(n, parentActiveNodeArray)).length > 0
    const isOpen = tableId === table.id ?? parentIsOpen
    const childrenCount = await dexie.rows
      .where({ deleted: 0, table_id: table.id })
      .count()
    const children = isOpen
      ? await rowNodes({
          table,
          rowId,
          addOpenNodes,
        })
      : []
    const label = labelFromLabeledTable({
      object: table,
      useLabels: project.use_labels,
    })
    const node = {
      id: table.id,
      label,
      type: 'table',
      object: table,
      activeNodeArray: ['projects', table.project_id, 'tables', table.id],
      isOpen,
      children,
      childrenCount,
    }
    tableNodes.push(node)
  }
  addOpenNodes(tableNodes.map((n) => n.activeNodeArray))
  return tableNodes
}

export default tableNodesEditingData
