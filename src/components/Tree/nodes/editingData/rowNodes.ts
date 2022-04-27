import { dexie, Row } from '../../../../dexieClient'
import rowsWithLabelFromRows from '../../../../utils/rowsWithLabelFromRows'
import existsNode from '../../../../utils/existsNode'
import rowNodes from './rowNodes'

const rowNodes = async ({ project, table, rowId, addNodes, nodes }) => {
  // return if parent is not open (in nodes)
  if (
    !existsNode({ nodes, url: ['projects', project.id, 'tables', table.id] })
  ) {
    return []
  }

  const rows = await dexie.rows
    .where({
      deleted: 0,
      table_id: table.id,
    })
    .toArray()
  const rowsWithLabels = await rowsWithLabelFromRows(rows)

  // console.log('rowNodes', { table, rows, rowsWithLabels })

  // console.log('rowNodes, rowsWithLabels', rowsWithLabels)

  const rowNodes = []
  for (const row: Row of rowsWithLabels) {
    const isOpen = rowId === row.id
    const childrenCount = await dexie.ttables
      .where({ deleted: 0, parent_id: table.id })
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

    const node = {
      id: row.id,
      label: row.label,
      type: 'row',
      object: row,
      activeNodeArray: [
        'projects',
        table.project_id,
        'tables',
        table.id,
        'rows',
        row.id,
      ],
      isOpen,
      children: [],
      childrenCount,
    }
    rowNodes.push(node)
  }

  return rowNodes
}

export default rowNodes
