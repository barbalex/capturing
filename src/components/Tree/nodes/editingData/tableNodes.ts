import isEqual from 'lodash/isEqual'

import { dexie, Table } from '../../../../dexieClient'
import sortByLabelName from '../../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'
import existsNode from '../../../../utils/existsNode'
import rowNodes from './rowNodes'

const tableNodesEditingData = async ({
  project,
  tableId,
  rowId,
  nodes,
  addNodes,
}) => {
  console.log('tableNodesEditingData', { nodes: nodes.slice() })
  // return if parent is not open (in nodes)
  if (!existsNode({ nodes, url: ['projects', project.id] })) return

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
    const isOpen = existsNode({
      nodes,
      url: ['projects', table.project_id, 'tables', table.id],
    })

    const node = {
      id: table.id,
      label: labelFromLabeledTable({
        object: table,
        useLabels: project.use_labels,
      }),
      type: 'table',
      object: table,
      activeNodeArray: ['projects', table.project_id, 'tables', table.id],
      isOpen,
      children: await rowNodes({ project, table, rowId, addNodes, nodes }),
      childrenCount: await dexie.rows
        .where({ deleted: 0, table_id: table.id })
        .count(),
    }
    tableNodes.push(node)
  }
  addNodes(tableNodes.map((n) => n.activeNodeArray))
  return tableNodes
}

export default tableNodesEditingData
