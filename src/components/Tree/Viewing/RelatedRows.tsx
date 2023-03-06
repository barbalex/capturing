import Node from '../Node'

const ViewingRelatedRows = ({
  project,
  table,
  row,
  url: urlPassed,
  rows = [],
}) =>
  rows.map((r) => {
    const url = [...urlPassed, 'rows', r.id]
    const node = {
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
