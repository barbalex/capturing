// import { getSnapshot } from 'mobx-state-tree'

import { dexie } from '../../../../dexieClient'
import sortByLabelName from '../../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'
import isNodeOpen from '../../isNodeOpen'
import rowNodes from './rows'

const tableNodesEditingData = async ({
  project,
  rowId,
  tableId,
  tableId2,
  rowId2,
  nodes,
}) => {
  // console.log('tableNodesEditingData', { nodes: getSnapshot(nodes) })
  // return if parent does not exist (in nodes)
  if (!isNodeOpen({ nodes, url: ['projects', project.id] })) return []

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
  // console.log('tableNodesEditingData', { tablesSorted })

  const tableNodes = []
  for (const table of tablesSorted) {
    const node = {
      id: table.id,
      label: labelFromLabeledTable({
        object: table,
        useLabels: project.use_labels,
      }),
      type: 'table',
      object: table,
      activeNodeArray: ['projects', table.project_id, 'tables', table.id],
      children: await rowNodes({
        project,
        table,
        rowId,
        tableId,
        tableId2,
        rowId2,
        nodes,
      }),
      childrenCount: await dexie.rows
        .where({ deleted: 0, table_id: table.id })
        .count(),
    }
    tableNodes.push(node)
  }
  // console.log('tableNodesEditingData', { tableNodes })

  return tableNodes
}

export default tableNodesEditingData
