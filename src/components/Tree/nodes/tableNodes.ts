import { dexie, Table } from '../../../dexieClient'
import sortByLabelName from '../../../utils/sortByLabelName'
import rowNodes from './rowNodes'

const tableNodes = async ({ project, tableId, rowId }) => {
  const tables = await dexie.ttables
    .where({
      deleted: 0,
      project_id: project.id,
    })
    .toArray()
  console.log('tableNodes', { project, tableId, tables })
  const tablesSorted = sortByLabelName({
    objects: tables,
    useLabels: project.use_labels,
  })

  console.log('tableNodes, tablesSorted', tablesSorted)

  const tableNodes = []
  for (const table: Table of tablesSorted) {
    const isOpen = tableId === table.id
    const childrenCount = await dexie.rows
      .where({ deleted: 0, table_id: table.id })
      .count()
    const children = isOpen
      ? await rowNodes({
          project,
          table,
          rowId,
        })
      : []
    const node = {
      ...table,
      isOpen,
      children,
      childrenCount,
    }
    tableNodes.push(node)
  }

  return tableNodes
}

export default tableNodes
