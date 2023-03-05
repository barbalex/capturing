import { useLiveQuery } from 'dexie-react-hooks'

import { dexie } from '../../../dexieClient'
import Node from '../Node'
import rowsWithLabelFromRows from '../../../utils/rowsWithLabelFromRows'

// TODO: show related rows as children
// 1. get list of fields
// 2. get list of related tables
// 3. build folders for all related tables
const ViewingRows = ({ project, table }) => {
  const rows = useLiveQuery(async () => {
    const rows = await dexie.rows
      .where({
        deleted: 0,
        table_id: table.id,
      })
      .toArray()
    const rowsWithLabels = await rowsWithLabelFromRows(rows)

    return rowsWithLabels
  })

  if (!rows) return null

  return rows.map((row) => {
    const node = {
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

export default ViewingRows
