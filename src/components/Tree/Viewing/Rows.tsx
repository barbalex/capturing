import { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { observer } from 'mobx-react-lite'

import { dexie, Field, Project, Row, Table } from '../../../dexieClient'
import Node from '../Node'
import rowsWithLabelFromRows from '../../../utils/rowsWithLabelFromRows'
import isNodeOpen from '../isNodeOpen'
import storeContext from '../../../storeContext'
import RelatedTables from './RelatedTables'
import { IStore } from '../../../store'
import { TreeNode } from './index'

interface Props {
  project: Project
  table: Table
}

export interface RelatedTable {
  fieldName: string
  table: Table
  type: 'to' | 'from'
}

// show related rows as children
// 1. get list of fields
// 2. get list of related tables
// 3. build folders for all related tables
const ViewingRows = ({ project, table }: Props) => {
  const store: IStore = useContext(storeContext)
  const { nodes } = store

  const data = useLiveQuery(async () => {
    const rows: Row[] = await dexie.rows
      .where({
        deleted: 0,
        table_id: table.id,
      })
      .toArray()
    const rowsWithLabels = await rowsWithLabelFromRows(rows)
    const fieldsRelatedTo: Field[] = await dexie.fields
      .where(['deleted', 'table_id', 'table_rel'])
      .between([0, table.id, ''], [0, table.id, 'ZZZZZZZZZZZZZZ'])
      .toArray()
    const fieldsRelatedFrom: Field[] = await dexie.fields
      .where({ deleted: 0, table_rel: table.id })
      .toArray()
    const tablesRelatedTo = {}
    for (const field of fieldsRelatedTo) {
      const tableRelatedTo: Table[] = await dexie.ttables.get(field.table_rel)
      tablesRelatedTo[field.name] = tableRelatedTo
    }
    const tablesRelatedFrom = {}
    for (const field of fieldsRelatedFrom) {
      const tableRelatedFrom: Table[] = await dexie.ttables.get(field.table_id)
      tablesRelatedFrom[field.name] = tableRelatedFrom
    }
    const relatedTables: RelatedTable[] = [
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

    return {
      rows: rowsWithLabels,
      relatedTables,
    }
  }, [table.id])

  const rows = data?.rows
  const relatedTables = data?.relatedTables ?? []

  if (!rows) return null

  return rows.map((row) => {
    const url = ['projects', project.id, 'tables', table.id, 'rows', row.id]
    const node: TreeNode = {
      id: row.id,
      label: row.label,
      type: 'row',
      object: row,
      url,
      childrenCount: relatedTables.length,
      projectId: project.id,
    }
    const isOpen = isNodeOpen({ url, nodes })

    return (
      <div key={row.id}>
        <Node node={node} />
        {isOpen && (
          <RelatedTables
            project={project}
            relatedTables={relatedTables}
            row={row}
            url={url}
          />
        )}
      </div>
    )
  })
}

export default observer(ViewingRows)
