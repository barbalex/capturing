import { dexie, Field } from '../../../../dexieClient'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'
import isNodeOpen from '../../../../utils/isNodeOpen'

const fieldNodes = async ({ project, table, fieldId, nodes }) => {
  // return if parent does not exist (in nodes)
  if (
    !isNodeOpen({
      nodes,
      url: ['projects', project.id, 'tables', table.id, 'fields'],
    })
  ) {
    return
  }

  const fields: Field[] = await dexie.fields
    .where({
      deleted: 0,
      table_id: table.id,
    })
    .toArray()

  const fieldNodes = []
  for (const field: Field of fields) {
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
      isOpen: false,
      children: [],
      childrenCount: 0,
    }
    fieldNodes.push(node)
  }

  return fieldNodes
}

export default fieldNodes
