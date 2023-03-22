import { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { observer } from 'mobx-react-lite'

import { dexie, Table, Project } from '../../../dexieClient'
import Node from '../Node'
import sortByLabelName from '../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'
import isNodeOpen from '../isNodeOpen'
import storeContext from '../../../storeContext'
import Rows from './Rows'
import { IStore } from '../../../store'
import { TreeNode } from './index'

type Props = {
  project: Project
  table: Table
}

const TableNode = ({ project, table }: Props) => {
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
      {isOpen && <Rows project={project} table={table} />}
    </>
  )
}

const ObservedTableNode = observer(TableNode)

const ViewingTables = ({ project }: { project: Project }) => {
  const tables: Table[] =
    useLiveQuery(
      () =>
        dexie.ttables
          .where({
            deleted: 0,
            project_id: project.id,
          })
          .toArray(),
      [project.id],
    ) ?? []

  const tablesSorted = sortByLabelName({
    objects: tables,
    useLabels: project.use_labels,
  })

  return tablesSorted.map((table) => (
    <ObservedTableNode key={table.id} project={project} table={table} />
  ))
}

export default ViewingTables
