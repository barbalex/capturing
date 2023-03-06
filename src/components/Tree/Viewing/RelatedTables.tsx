import { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { observer } from 'mobx-react-lite'

import { dexie } from '../../../dexieClient'
import Node from '../Node'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'
import isNodeOpen from '../isNodeOpen'
import storeContext from '../../../storeContext'
import Rows from './RelatedRows'
import rowsWithLabelFromRows from '../../../utils/rowsWithLabelFromRows'

const RelatedTableNode = ({
  project,
  table,
  fieldName,
  type,
  row,
  url: urlPassed,
}) => {
  const store = useContext(storeContext)
  const { nodes } = store

  // depending on type, filter by id
  // TODO: do this in lists
  const where = {
    deleted: 0,
    table_id: table.id,
  }
  if (type === 'to' && row.data?.[fieldName]) {
    where.id = row.data?.[fieldName]
  }
  let children =
    useLiveQuery(async () => {
      const rows = await dexie.rows.where(where).toArray()
      const rowsWithLabels = await rowsWithLabelFromRows(rows)

      return rowsWithLabels
    }, [table.id, fieldName]) ?? []
  if (type === 'from') {
    children = children.filter((c) => c.data?.[fieldName] === row.id)
  }
  const url = [...urlPassed, 'tables', table.id]
  const label = labelFromLabeledTable({
    object: table,
    useLabels: project.use_labels,
  })

  const node = {
    id: table.id,
    label: `${label} (${children?.length})`,
    type: 'table',
    object: table,
    url,
    childrenCount: children?.length,
    projectId: project.id,
  }

  const isOpen = isNodeOpen({
    nodes,
    url,
  })

  return (
    <>
      <Node node={node} />
      {isOpen && (
        <Rows
          project={project}
          table={table}
          row={row}
          url={url}
          rows={children}
        />
      )}
    </>
  )
}

const ObservedTableNode = observer(RelatedTableNode)

const RelatedTables = ({
  project,
  tablesRelatedTo,
  tablesRelatedFrom,
  row,
  url,
}) => {
  const tables = [
    ...(Object.entries(tablesRelatedTo).length
      ? Object.entries(tablesRelatedTo).map((o) => ({
          fieldName: o[0],
          table: o[1],
          type: 'to',
        }))
      : []),
    ...(Object.entries(tablesRelatedFrom).length
      ? Object.entries(tablesRelatedFrom).map((o) => ({
          fieldName: o[0],
          table: o[1],
          type: 'from',
        }))
      : []),
  ]

  // TODO: sort tables?

  return tables.map((t) => (
    <ObservedTableNode
      key={`${row.id}/${t.table.id}`}
      project={project}
      table={t.table}
      fieldName={t.fieldName}
      type={t.type}
      row={row}
      url={url}
    />
  ))
}

export default RelatedTables
