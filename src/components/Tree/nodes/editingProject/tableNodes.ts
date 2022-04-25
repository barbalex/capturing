import { dexie, Table } from '../../../../dexieClient'
import sortByLabelName from '../../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'
import buildFolders from './tableFolders'

const tableNodesEditingProject = async ({
  project,
  tableId,
  fieldId,
  rowId,
  pathname,
  openNodes,
}) => {
  const tables = await dexie.ttables
    .where({
      deleted: 0,
      project_id: project.id,
    })
    .toArray()
  const tablesSorted = sortByLabelName({
    objects: tables,
    useLabels: project.use_labels,
  })

  const tableNodes = []
  for (const table: Table of tablesSorted) {
    const ownActiveNodeArray = [
      'projects',
      table.project_id,
      'tables',
      table.id,
    ]
    const isInActiveNodes =
      openNodes.filter((n) => isEqual(n, ownActiveNodeArray)).length > 0
    if (!isInActiveNodes) return

    const isOpen = tableId === table.id
    const childrenCount = await dexie.rows
      .where({ deleted: 0, table_id: table.id })
      .count()
    const children = isOpen
      ? await buildFolders({
          project,
          table,
          fieldId,
          rowId,
          pathname,
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
      activeNodeArray: ownActiveNodeArray,
      isOpen,
      children,
      childrenCount,
    }
    tableNodes.push(node)
  }

  return tableNodes
}

export default tableNodesEditingProject
