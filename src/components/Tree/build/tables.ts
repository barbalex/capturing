import { dexie, Table } from '../../../dexieClient'
import sortByLabelName from '../../../utils/sortByLabelName'

const tableNodes = async ({ useLabels, project, tableId, fieldId, rowId }) => {
  const tables = await dexie.ttables.where({
    deleted: 0,
    project_id: project.id,
  })
  const tablesSorted = sortByLabelName({ objects: tables, useLabels })

  const tableNodes = []
  for (const table: Table of tablesSorted) {
    const isOpen = tableId === table.id
    const childrenCount = await dexie.rows
      .where({ deleted: 0, table_id: table.id })
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
      ...table,
      isOpen,
      children: [],
      childrenCount,
    }
    tableNodes.push(node)
  }
}

export default tableNodes
