import { dexie, Project } from '../../../dexieClient'
import sortProjectsByLabelName from '../../../utils/sortProjectsByLabelName'
import tableNodes from './tables'

const buildTree = async ({ projectId, tableId, rowId, fieldId }) => {
  const projects: Project[] = await dexie.projects
    .where({ deleted: 0 })
    .sortBy('', sortProjectsByLabelName)

  const projectNodes = []
  for (const project of projects) {
    const isOpen = projectId === project.id
    console.log('buildProjects', { project, projectId, isOpen })
    const childrenCount = await dexie.ttables
      .where({ deleted: 0, project_id: project.id })
      .count()
    const children = isOpen
      ? await tableNodes({
          useLabels: project.use_labels,
          project,
          tableId,
          fieldId,
          rowId,
        })
      : []
    const node = {
      ...project,
      isOpen,
      children,
      childrenCount,
    }
    projectNodes.push(node)
  }

  return { id: 'root', children: projectNodes }
}

export default buildTree
