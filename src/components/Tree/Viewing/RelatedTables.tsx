import { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { observer } from 'mobx-react-lite'

import { dexie, Table } from '../../../dexieClient'
import Node from '../Node'
import sortByLabelName from '../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'
import isNodeOpen from '../isNodeOpen'
import storeContext from '../../../storeContext'
import Rows from './Rows'

const TableNode = ({ project, table, url: urlPassed }) => {
  const store = useContext(storeContext)
  const { nodes } = store

  const childrenCount = useLiveQuery(() =>
    dexie.rows.where({ deleted: 0, table_id: table.id }).count(),
  )
  const url = [...urlPassed, 'tables', table.id]
  const label = labelFromLabeledTable({
    object: table,
    useLabels: project.use_labels,
  })

  const node = {
    id: table.id,
    label: `${label} (${childrenCount})`,
    type: 'table',
    object: table,
    url,
    childrenCount,
    projectId: project.id,
  }

  const isOpen = isNodeOpen({
    nodes,
    url,
  })

  return (
    <>
      <Node node={node} />
      {isOpen && <Rows project={project} table={table} />}
    </>
  )
}

const ObservedTableNode = observer(TableNode)

const RelatedTables = ({ project, tables, url }) => {
  const tablesSorted = sortByLabelName({
    objects: tables,
    useLabels: project.use_labels,
  })

  return tablesSorted.map((table) => (
    <ObservedTableNode
      key={table.id}
      project={project}
      table={table}
      url={url}
    />
  ))
}

export default RelatedTables
