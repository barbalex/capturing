import { dexie } from '../../../../dexieClient'
import rowsWithLabelFromRows from '../../../../utils/rowsWithLabelFromRows'
import isNodeOpen from '../../../../utils/isNodeOpen'
import rowTableNodes from './rowTables'

const rowNodes = async ({
  project,
  table,
  rowId,
  tableId,
  tableId2,
  rowId2,
  nodes,
}) => {
  // return if parent is not open (in nodes)
  if (
    !isNodeOpen({ nodes, url: ['projects', project.id, 'tables', table.id] })
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
  for (const row of rowsWithLabels) {
    const isOpen = rowId === row.id
    const fieldsWithRelation = await dexie.fields
      .where({ deleted: 0, table_rel: table.id })
      .toArray()
    const tableIdsOfFieldsWithRelation = fieldsWithRelation.map(
      (f) => f.table_id,
    )
    const tablesWithRelation = await dexie.ttables.bulkGet(
      tableIdsOfFieldsWithRelation,
    )
    // console.log('rowNodes', {
    //   fieldsWithRelation,
    //   tableIdsOfFieldsWithRelation,
    //   tablesWithRelation,
    // })

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
      // TODO:
      // if: exist tables with field table_rel referencing this table
      // add table nodes and child row nodes
      children: await rowTableNodes({
        project,
        table,
        row,
        tables: tablesWithRelation,
        nodes,
        tableId,
        tableId2,
        rowId,
        rowId2,
      }),
      childrenCount: tablesWithRelation.length,
    }
    rowNodes.push(node)
  }

  return rowNodes
}

export default rowNodes
