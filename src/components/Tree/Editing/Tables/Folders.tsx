import { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { observer } from 'mobx-react-lite'

import { dexie, Project, Table } from '../../../../dexieClient'
import Node from '../../Node'
import isNodeOpen from '../../isNodeOpen'
import storeContext from '../../../../storeContext'
import Rows from './Rows'
import Fields from './Fields'
import { IStore } from '../../../../store'
import { TreeNode } from '../../Viewing'

interface Props {
  project: Project
  table: Table
}

const TableFolders = ({ project, table }: Props) => {
  const store: IStore = useContext(storeContext)
  const { nodes } = store

  const data = useLiveQuery(async () => {
    const [rowsCount, fieldsCount]: [number, number] = await Promise.all([
      dexie.rows
        .where({
          deleted: 0,
          table_id: table.id,
        })
        .count(),
      dexie.fields
        .where({
          deleted: 0,
          table_id: table.id,
        })
        .count(),
    ])

    return { rowsCount, fieldsCount }
  })

  if (!data) return null

  const rowsNode: TreeNode = {
    id: `${table.id}/rowsFolder`,
    label: `Datensätze (${data.rowsCount})`,
    type: 'rowsFolder',
    object: table,
    url: ['projects', project.id, 'tables', table.id, 'rows'],
    childrenCount: data.rowsCount,
    projectId: project.id,
  }
  const rowsOpen = isNodeOpen({
    nodes,
    url: ['projects', project.id, 'tables', table.id, 'rows'],
  })
  const fieldsNode: TreeNode = {
    id: `${table.id}/fieldsFolder`,
    label: `Felder (${data.fieldsCount})`,
    type: 'fieldsFolder',
    object: table,
    url: ['projects', project.id, 'tables', table.id, 'fields'],
    childrenCount: data.fieldsCount,
    projectId: project.id,
  }
  const fieldsOpen = isNodeOpen({
    nodes,
    url: ['projects', project.id, 'tables', table.id, 'fields'],
  })

  return (
    <>
      <Node node={rowsNode} />
      {rowsOpen && <Rows project={project} table={table} />}
      <Node node={fieldsNode} />
      {fieldsOpen && <Fields project={project} table={table} />}
    </>
  )
}

export default observer(TableFolders)
