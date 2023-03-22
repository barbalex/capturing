import { Project, Table } from '../../../dexieClient'
import Node from '../Node'
import { TreeNode } from './index'

interface Props {
  project: Project
  table: Table
  row: RowWithLabel
  url: string[]
  rows: RowWithLabel[]
}

const ViewingRelatedRows = ({
  project,
  table,
  row,
  url: urlPassed,
  rows = [],
}: Props) =>
  rows.map((r) => {
    const url = [...urlPassed, 'rows', r.id]
    const node: TreeNode = {
      id: r.id,
      label: r.label,
      type: 'row',
      object: r,
      url,
      childrenCount: 0,
      projectId: project.id,
    }

    return <Node key={`${row.id}/${table.id}/${r.id}`} node={node} />
  })

export default ViewingRelatedRows
