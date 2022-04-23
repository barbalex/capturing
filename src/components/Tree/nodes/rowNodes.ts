import { dexie, Row } from '../../../dexieClient'
import sortByLabelName from '../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'

const rowNodes = async ({ project, table, rowId }) => {
  const rows = await dexie.rows
    .where({
      deleted: 0,
      table_id: table.id,
    })
    .toArray()
  console.log('rowNodes', { table, rows })
  const rowsSorted = sortByLabelName({
    objects: rows,
    useLabels: project.use_labels,
  })

  console.log('rowNodes, rowsSorted', rowsSorted)

  const rowNodes = []
  for (const row: Row of rowsSorted) {
    const isOpen = rowId === row.id
    const childrenCount = await dexie.rows
      .where({ deleted: 0, parent_id: row.id })
      .count()
    // const children = isOpen
    //   ? await tableNodes({
    //       useLabels: project.use_labels,
    //       project,
    //       tableId,
    //       fieldId,
    //       rowId,
    //     })
    //   : []
    const label = labelFromLabeledTable({
      object: row,
      useLabels: project.use_labels,
    })
    const node = {
      id: row.id,
      label,
      object: row,
      isOpen,
      children: [],
      childrenCount,
    }
    rowNodes.push(node)
  }

  return rowNodes
}

export default rowNodes
