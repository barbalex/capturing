import { useState, useEffect } from 'react'

import Node from '../Node'

const Row = ({ project, url: urlPassed, row }) => {
  const [label, setLabel] = useState('')
  useEffect(() => {
    row?.label.then((label) => setLabel(label))
  }, [row?.label])

  const url = [...urlPassed, 'rows', row.id]
  const node = {
    id: row.id,
    label,
    type: 'row',
    object: row,
    url,
    childrenCount: 0,
    projectId: project.id,
  }

  return <Node node={node} />
}

const ViewingRelatedRows = ({ project, table, row, url, rows = [] }) =>
  rows.map((r) => (
    <Row
      key={`${row.id}/${table.id}/${r.id}`}
      project={project}
      url={url}
      row={r}
    />
  ))

export default ViewingRelatedRows
