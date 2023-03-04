import { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { observer } from 'mobx-react-lite'

import { dexie, Table } from '../../../../dexieClient'
import Node from '../../Node'
import sortByLabelName from '../../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'
import isNodeOpen from '../../isNodeOpen'
import storeContext from '../../../../storeContext'

const TableNode = ({ project, table }) => {
  const store = useContext(storeContext)
  const { nodes } = store

  const childrenCount = useLiveQuery(() =>
    dexie.rows.where({ deleted: 0, table_id: table.id }).count(),
  )
  const url = ['projects', project.id, 'tables', table.id]

  const node = {
    id: table.id,
    label: labelFromLabeledTable({
      object: table,
      useLabels: project.use_labels,
    }),
    type: 'table',
    object: table,
    url,
    childrenCount,
  }

  const isOpen = isNodeOpen({
    nodes,
    url,
  })

  return <Node node={node} />
}

const ObservedTableNode = observer(TableNode)

const Tables = ({ project }) => {
  const tables: Table[] = useLiveQuery(() =>
    dexie.ttables
      .where({
        deleted: 0,
        project_id: project.id,
      })
      .toArray(),
  )

  if (!tables) return null

  const tablesSorted = sortByLabelName({
    objects: tables,
    useLabels: project.use_labels,
  })

  return tablesSorted.map((table) => (
    <ObservedTableNode key={table.id} project={project} table={table} />
  ))
}

export default Tables
