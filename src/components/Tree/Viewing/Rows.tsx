import { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { observer } from 'mobx-react-lite'

import { dexie } from '../../../dexieClient'
import Node from '../Node'
import rowsWithLabelFromRows from '../../../utils/rowsWithLabelFromRows'
import isNodeOpen from '../isNodeOpen'
import storeContext from '../../../storeContext'
import RelatedTables from './RelatedTables'

// TODO: show related rows as children
// 1. get list of fields
// 2. get list of related tables
// 3. build folders for all related tables
const ViewingRows = ({ project, table }) => {
  const store = useContext(storeContext)
  const { nodes } = store

  const data = useLiveQuery(async () => {
    const rows = await dexie.rows
      .where({
        deleted: 0,
        table_id: table.id,
      })
      .toArray()
    const rowsWithLabels = await rowsWithLabelFromRows(rows)
    const fieldsRelatedTo = await dexie.fields
      .where(['deleted', 'table_id', 'table_rel'])
      .between([0, table.id, ''], [0, table.id, 'ZZZZZZZZZZZZZZ'])
      .toArray()
    const fieldsRelatedFrom = await dexie.fields
      .where({ deleted: 0, table_rel: table.id })
      .toArray()
    const tablesRelatedTo = await dexie.ttables
      .where('id')
      .anyOf(fieldsRelatedTo.map((f) => f.table_rel))
      .toArray()
    const tablesRelatedFrom = await dexie.ttables
      .where('id')
      .anyOf(fieldsRelatedFrom.map((f) => f.table_id))
      .toArray()

    return {
      rows: rowsWithLabels,
      relatedTables: [...(tablesRelatedTo ?? []), ...(tablesRelatedFrom ?? [])],
    }
  })

  const rows = data?.rows
  const relatedTables = data?.relatedTables

  console.log('ViewingRows', {
    table: table.name,
    relatedTables: relatedTables?.map((t) => t.name),
  })

  if (!rows) return null

  return rows.map((row) => {
    const url = ['projects', project.id, 'tables', table.id, 'rows', row.id]
    const node = {
      id: row.id,
      label: row.label,
      type: 'row',
      object: row,
      url,
      childrenCount: 0,
      projectId: project.id,
    }
    const isOpen = isNodeOpen({ url, nodes })

    return (
      <div key={row.id}>
        <Node node={node} />
        {isOpen && (
          <RelatedTables project={project} tables={relatedTables} url={url} />
        )}
      </div>
    )
  })
}

export default observer(ViewingRows)
