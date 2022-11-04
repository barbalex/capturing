import { dexie, Table } from '../../../../dexieClient'
import sortByLabelName from '../../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'
import isNodeOpen from '../../../../utils/isNodeOpen'
import rowNodes from './rows'

const tableNodesEditingData = async ({ project, rowId, nodes }) => {
  // console.log('tableNodesEditingData', { nodes: nodes.slice() })
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

  const tableNodes = []
  for (const table: Table of tablesSorted) {
    const isOpen = isNodeOpen({
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
      children: await rowNodes({ project, table, rowId, nodes }),
      childrenCount: await dexie.rows
        .where({ deleted: 0, table_id: table.id })
        .count(),
    }
    tableNodes.push(node)
  }

  return tableNodes
}

export default tableNodesEditingData
