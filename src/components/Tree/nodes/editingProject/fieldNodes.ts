import { dexie, Field } from '../../../../dexieClient'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'

const fieldNodes = async ({ project, table, fieldId, nodes }) => {
  const fields: Field[] = await dexie.fields
    .where({
      deleted: 0,
      table_id: table.id,
    })
    .toArray()

  const fieldNodes = []
  for (const field: Field of fields) {
    const isOpen = fieldId === field.id

    const node = {
      id: field.id,
      label: await labelFromLabeledTable({
        object: field,
        useLabels: project.use_labels,
      }),
      type: 'field',
      object: field,
      activeNodeArray: [
        'projects',
        table.project_id,
        'tables',
        table.id,
        'fields',
        field.id,
      ],
      isOpen,
      children: [],
      childrenCount: 0,
    }
    fieldNodes.push(node)
  }

  return fieldNodes
}

export default fieldNodes
