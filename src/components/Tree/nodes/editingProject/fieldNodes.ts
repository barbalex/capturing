import { dexie, Field } from '../../../../dexieClient'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'

const fieldNodes = async ({ project, table, fieldId }) => {
  const fields = await dexie.fields
    .where({
      deleted: 0,
      table_id: table.id,
    })
    .toArray()
  const fieldsWithLabels = await labelFromLabeledTable({
    objects: fields,
    useLabels: project.use_labels,
  })

  const fieldNodes = []
  for (const field: Field of fieldsWithLabels) {
    const isOpen = fieldId === field.id

    const node = {
      id: field.id,
      label: field.label,
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
