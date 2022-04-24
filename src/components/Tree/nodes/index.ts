import { dexie, Project } from '../../../dexieClient'
import sortProjectsByLabelName from '../../../utils/sortProjectsByLabelName'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'
import tableNodes from './tableNodes'

const buildTree = async ({ projectId, tableId, rowId, fieldId }) => {
  const projects: Project[] = await dexie.projects
    .where({ deleted: 0 })
    .sortBy('', sortProjectsByLabelName)

  const projectNodes = []
  for (const project of projects) {
    const isOpen = projectId === project.id
    const childrenCount = await dexie.ttables
      .where({ deleted: 0, project_id: project.id })
      .count()
    const children = isOpen
      ? await tableNodes({
          project,
          tableId,
          fieldId,
          rowId,
        })
      : []
    const label = labelFromLabeledTable({
      object: project,
      useLabels: project.use_labels,
    })
    const node = {
      id: project.id,
      label,
      type: 'project',
      object: project,
      activeNodeArray: ['projects', project.id],
      isOpen,
      children,
      childrenCount,
    }
    projectNodes.push(node)
  }

  return { id: 'root', children: projectNodes }
}

export default buildTree
