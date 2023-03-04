import { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { observer } from 'mobx-react-lite'

import { dexie } from '../../../../dexieClient'
import Node from '../../Node'
import isNodeOpen from '../../isNodeOpen'
import storeContext from '../../../../storeContext'

const TableFolders = ({ project, table }) => {
  const store = useContext(storeContext)
  const { nodes } = store

  const data = useLiveQuery(async () => {
    const [rowsCount, fieldsCount] = await Promise.all([
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

  const rowsNode = {
    id: `${table.id}/rowsFolder`,
    label: `Datensätze (${data.rowsCount})`,
    type: 'rowsFolder',
    object: table,
    url: ['projects', project.id, 'tables', table.id, 'rows'],
    childrenCount: data.rowsCount,
  }
  const rowsOpen = isNodeOpen({
    nodes,
    url: ['projects', project.id, 'tables', table.id, 'rows'],
  })
  const fieldsNode = {
    id: `${table.id}/fieldsFolder`,
    label: `Felder (${data.fieldsCount})`,
    type: 'fieldsFolder',
    object: table,
    url: ['projects', project.id, 'tables', table.id, 'fields'],
    childrenCount: data.fieldsCount,
  }
  const fieldsOpen = isNodeOpen({
    nodes,
    url: ['projects', project.id, 'tables', table.id, 'fields'],
  })

  return (
    <>
      <Node node={rowsNode} />
      {rowsOpen && <div>children</div>}
      <Node node={fieldsNode} />
      {fieldsOpen && <div>children</div>}
    </>
  )
}

export default observer(TableFolders)
