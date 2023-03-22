import { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { observer } from 'mobx-react-lite'

import { dexie, Project, Table, Row, Project } from '../../../dexieClient'
import Node from '../Node'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'
import isNodeOpen from '../isNodeOpen'
import storeContext from '../../../storeContext'
import Rows from './RelatedRows'
import rowsWithLabelFromRows, {
  RowWithLabel,
} from '../../../utils/rowsWithLabelFromRows'
import { IStore } from '../../../store'
import { RelatedTable } from './Rows'
import { TreeNode } from './index'

interface RelatedTableNodeProps {
  project: Project
  table: Table
  fieldName: string
  type: 'from' | 'to'
  row: Row
  url: string[]
}

const RelatedTableNode = ({
  project,
  table,
  fieldName,
  type,
  row,
  url: urlPassed,
}: RelatedTableNodeProps) => {
  const store: IStore = useContext(storeContext)
  const { nodes } = store

  // depending on type, filter by id
  const where = {
    deleted: 0,
    table_id: table.id,
  }
  if (type === 'to' && row.data?.[fieldName]) {
    where.id = row.data?.[fieldName]
  }
  let children =
    useLiveQuery(async () => {
      const rows: Row[] = await dexie.rows.where(where).toArray()
      return await rowsWithLabelFromRows(rows)
    }, [table.id, fieldName]) ?? []
  if (type === 'from') {
    children = children.filter((c) => c.data?.[fieldName] === row.id)
  }
  const url = [...urlPassed, 'tables', table.id]
  const label = labelFromLabeledTable({
    object: table,
    useLabels: project.use_labels,
  })

  const node: TreeNode = {
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

interface RelatedTablesProps {
  project: Project
  relatedTables: RelatedTable[]
  row: RowWithLabel
  url: string[]
}

// TODO: sort tables?
const RelatedTables = ({
  project,
  relatedTables,
  row,
  url,
}: RelatedTablesProps) =>
  relatedTables.map((t) => (
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

export default RelatedTables
