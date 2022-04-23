import { dexie, Project } from '../../../dexieClient'
import sortProjectsByLabelName from '../../../utils/sortProjectsByLabelName'

const buildTree = async () => {
  const projects: Project[] = await dexie.projects
    .where({ deleted: 0 })
    .sortBy('', sortProjectsByLabelName)
  console.log('buildTree returning projects:', projects)

  return { id: 'root', children: projects }
}

export default buildTree
