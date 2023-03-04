import { useLiveQuery } from 'dexie-react-hooks'

import { dexie, Field } from '../../../../dexieClient'
import Node from '../../Node'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'

const FieldNode = ({ project, table, field }) => {
  const url = [
    'projects',
    table.project_id,
    'tables',
    table.id,
    'fields',
    field.id,
  ]

  const node = {
    id: field.id,
    label: labelFromLabeledTable({
      object: field,
      useLabels: project.use_labels,
    }),
    type: 'field',
    object: field,
    url,
    childrenCount: 0,
  }

  return <Node node={node} />
}

const Fields = ({ project, table }) => {
  const fields: Field[] = useLiveQuery(() =>
    dexie.fields
      .where({
        deleted: 0,
        table_id: table.id,
      })
      .sortBy('sort'),
  )

  if (!fields) return null

  return fields.map((field) => (
    <FieldNode key={field.id} project={project} table={table} field={field} />
  ))
}

export default Fields
