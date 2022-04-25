import { dexie, Table } from '../../../../dexieClient'
import sortByLabelName from '../../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'
import rowNodes from './rowNodes'

const tableNodesEditingData = async ({ project, tableId, rowId }) => {
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
    const isOpen = tableId === table.id
    const childrenCount = await dexie.rows
      .where({ deleted: 0, table_id: table.id })
      .count()
    const children = isOpen
      ? await rowNodes({
          table,
          rowId,
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

  return tableNodes
}

export default tableNodesEditingData
