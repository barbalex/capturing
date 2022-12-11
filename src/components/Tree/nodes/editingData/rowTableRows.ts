import { dexie, Row } from '../../../../dexieClient'
import rowsWithLabelFromRows from '../../../../utils/rowsWithLabelFromRows'
import isNodeOpen from '../../../../utils/isNodeOpen'

const rowTableRowNodes = async ({
  project,
  table,
  row,
  table2,
  nodes,
  tableId,
  tableId2,
  rowId,
  rowId2,
}) => {
  console.log('rowTableRows')
  // return if parent is not open (in nodes)
  if (
    !isNodeOpen({
      nodes,
      url: [
        'projects',
        project.id,
        'tables',
        table.id,
        'rows',
        row.id,
        'tables',
        table2.id,
        'rows',
      ],
    })
  ) {
    console.log('rowTableRows returning due to node not open')
    return []
  }

  const refFieldsOfTable = await dexie.fields.get({
    deleted: 0,
    table_rel: table2.id,
    table_id: tableId,
  })
  const row2s = await dexie.rows
    // TODO: add filter for table_rel
    .filter((r) => r.deleted === 0 && r.table_id === table2.id)
    .toArray()
  const row2sWithLabels = await rowsWithLabelFromRows(row2s)

  console.log('rowTableRows', {
    table2,
    rows,
    rowsWithLabels,
    refFieldsOfTable,
  })

  // console.log('rowNodes, rowsWithLabels', rowsWithLabels)

  const rowNodes = []
  for (const row2 of row2sWithLabels) {
    const isOpen = rowId2 === row2.id
    // const fieldsWithRelation = await dexie.fields
    //   .where({ deleted: 0, table_rel: table2.id })
    //   .toArray()
    // const tableIdsOfFieldsWithRelation = fieldsWithRelation.map(
    //   (f) => f.table_id,
    // )
    // const tablesWithRelation = await dexie.ttables.bulkGet(
    //   tableIdsOfFieldsWithRelation,
    // )
    // console.log('rowNodes', {
    //   fieldsWithRelation,
    //   tableIdsOfFieldsWithRelation,
    //   tablesWithRelation,
    // })

    const node = {
      id: row2.id,
      label: row2.label,
      type: 'row',
      object: row2,
      activeNodeArray: [
        'projects',
        project.id,
        'tables',
        tableId,
        'rows',
        rowId,
        'tables',
        table2.id,
        'rows',
        row2.id,
      ],
      isOpen,
      // TODO:
      // if: exist tables with field table_rel referencing this table
      // add table nodes and child row nodes
      children: [],
      childrenCount: 0,
    }
    rowNodes.push(node)
  }

  return rowNodes
}

export default rowTableRowNodes
