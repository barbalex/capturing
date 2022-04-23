import { dexie, Project } from '../../../dexieClient'
import sortProjectsByLabelName from '../../../utils/sortProjectsByLabelName'

const buildTree = async ({ projectId, tableId, rowId, fieldId }) => {
  const projects: Project[] = await dexie.projects
    .where({ deleted: 0 })
    .sortBy('', sortProjectsByLabelName)
  console.log('buildTree returning projects:', projects)
  const projectNodes = []
  for (const p of projects) {
    const node = { ...p, isOpen: projectId === p.id, children: [] }
    projectNodes.push(node)
  }

  return { id: 'root', children: projectNodes }
}

export default buildTree
