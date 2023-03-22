import { useLiveQuery } from 'dexie-react-hooks'

import { dexie, Field, Project, Table } from '../../../../dexieClient'
import Node from '../../Node'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'
import { TreeNode } from '../../Viewing'

interface Props {
  project: Project
  table: Table
}

const Fields = ({ project, table }: Props) => {
  const fields: Field[] | undefined = useLiveQuery(() =>
    dexie.fields
      .where({
        deleted: 0,
        table_id: table.id,
      })
      .sortBy('sort'),
  )

  if (!fields) return null

  return fields.map((field) => {
    const url = [
      'projects',
      table.project_id,
      'tables',
      table.id,
      'fields',
      field.id,
    ]

    const node: TreeNode = {
      id: field.id,
      label: labelFromLabeledTable({
        object: field,
        useLabels: project.use_labels,
      }),
      type: 'field',
      object: field,
      url,
      childrenCount: 0,
      projectId: project.id,
    }

    return <Node key={field.id} node={node} />
  })
}

export default Fields
