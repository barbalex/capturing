import { useLiveQuery } from 'dexie-react-hooks'

import { dexie, Project, Row, Table } from '../../../../dexieClient'
import Node from '../../Node'
import rowsWithLabelFromRows from '../../../../utils/rowsWithLabelFromRows'
import { TreeNode } from '../../Viewing'

interface Props {
  project: Project
  table: Table
}

const Rows = ({ project, table }: Props) => {
  const rows = useLiveQuery(async () => {
    const rows: Row[] = await dexie.rows
      .where({
        deleted: 0,
        table_id: table.id,
      })
      .toArray()
    return await rowsWithLabelFromRows(rows)
  })

  if (!rows) return null

  return rows.map((row) => {
    const node: TreeNode = {
      id: row.id,
      label: row.label,
      type: 'row',
      object: row,
      url: ['projects', project.id, 'tables', table.id, 'rows', row.id],
      childrenCount: 0,
      projectId: project.id,
    }

    return <Node key={row.id} node={node} />
  })
}

export default Rows
