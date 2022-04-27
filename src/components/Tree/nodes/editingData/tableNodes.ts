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
  activeNodeArray,
}) => {
  // console.log('tableNodesEditingData', { nodes: nodes.slice() })
  // return if parent does not exist (in nodes)
  if (!existsNode({ nodes, url: ['projects', project.id, 'tables'] })) return

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
  const _tableNodes = tableNodes.map((n) => n.activeNodeArray)
  // add rowFolder only if project is in activeNodeArray
  const _rowFolderNodes = tableNodes
    .filter((n) => activeNodeArray.includes(n.id))
    .map((n) => [...n.activeNodeArray, 'rows'])
  addNodes([..._tableNodes, ..._rowFolderNodes])
  return tableNodes
}

export default tableNodesEditingData
