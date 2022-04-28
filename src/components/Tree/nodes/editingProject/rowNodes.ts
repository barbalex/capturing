import { dexie, Row } from '../../../../dexieClient'
import rowsWithLabelFromRows from '../../../../utils/rowsWithLabelFromRows'
import isNodeOpen from '../../../../utils/isNodeOpen'

const rowNodes = async ({ table, rowId, nodes }) => {
  // return if parent does not exist (in nodes)
  if (
    !isNodeOpen({
      nodes,
      url: ['projects', project.id, 'tables', table.id, 'rows'],
    })
  ) {
    return
  }

  const rows = await dexie.rows
    .where({
      deleted: 0,
      table_id: table.id,
    })
    .toArray()
  const rowsWithLabels = await rowsWithLabelFromRows(rows)

  const rowNodes = []
  for (const row: Row of rowsWithLabels) {
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
      isOpen: isNodeOpen({
        nodes,
        url: ['projects', project.id, 'tables', table.id, 'rows', row.id],
      }),
      children: [],
      childrenCount: await dexie.ttables
        .where({ deleted: 0, parent_id: table.id })
        .count(),
    }
    rowNodes.push(node)
  }

  return rowNodes
}

export default rowNodes
