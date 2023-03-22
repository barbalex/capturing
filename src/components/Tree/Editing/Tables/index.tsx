import { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { observer } from 'mobx-react-lite'

import { dexie, Project, Table } from '../../../../dexieClient'
import Node from '../../Node'
import sortByLabelName from '../../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'
import isNodeOpen from '../../isNodeOpen'
import storeContext from '../../../../storeContext'
import Folders from './Folders'
import { IStore } from '../../../../store'
import { TreeNode } from '../../Viewing'

interface TableNodeProps {
  project: Project
  table: Table
}

const TableNode = ({ project, table }: TableNodeProps) => {
  const store: IStore = useContext(storeContext)
  const { nodes } = store

  const childrenCount: number | undefined = useLiveQuery(() =>
    dexie.rows.where({ deleted: 0, table_id: table.id }).count(),
  )
  const url = ['projects', project.id, 'tables', table.id]
  const label = labelFromLabeledTable({
    object: table,
    useLabels: project.use_labels,
  })

  const node: TreeNode = {
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
      {isOpen && <Folders project={project} table={table} />}
    </>
  )
}

const ObservedTableNode = observer(TableNode)

const Tables = ({ project }: { project: Project }) => {
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
