import { Table } from '../../../../dexieClient'
import sortByLabelName from '../../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'
import isNodeOpen from '../../../../utils/isNodeOpen'

const rowTableNodesEditingProject = async ({
  project,
  table,
  row,
  tables,
  nodes,
}) => {
  // return if parent does not exist (in nodes)
  if (
    !isNodeOpen({
      nodes,
      url: ['projects', project.id, 'tables', table.id, 'rows', row.id],
    })
  )
    return

  const tablesSorted = sortByLabelName({
    objects: tables,
    useLabels: project.use_labels,
  })

  const tableNodes = []
  for (const table: Table of tablesSorted) {
    const ownActiveNodeArray = [
      'projects',
      project.id,
      'tables',
      table.id,
      'rows',
      row.id,
      'tables',
      table.id,
    ]

    const node = {
      id: table.id,
      label: labelFromLabeledTable({
        object: table,
        useLabels: project.use_labels,
      }),
      type: 'table',
      object: table,
      activeNodeArray: ownActiveNodeArray,
      isOpen: isNodeOpen({
        nodes,
        url: ownActiveNodeArray,
      }),
      children: [],
      childrenCount: 0,
    }
    tableNodes.push(node)
  }

  return tableNodes
}

export default rowTableNodesEditingProject
