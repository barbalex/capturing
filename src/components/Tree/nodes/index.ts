import { dexie, Project } from '../../../dexieClient'
import sortProjectsByLabelName from '../../../utils/sortProjectsByLabelName'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'
import tableNodesEditingData from './editingData/tableNodes'
import projectFoldersEditingProject from './editingProject/projectFolders'

const buildTree = async ({
  projectId,
  tableId,
  rowId,
  fieldId,
  editingProjects,
  pathname,
  activeNodeArray,
  openNodes,
  addOpenNodes,
}) => {
  const projects: Project[] = await dexie.projects
    .where({ deleted: 0 })
    .sortBy('', sortProjectsByLabelName)

  const projectNodes = []
  for (const project of projects) {
    const isOpen = projectId === project.id
    const childrenCount = await dexie.ttables
      .where({ deleted: 0, project_id: project.id })
      .count()
    const editing = editingProjects[project.id]?.editing ?? false
    const children = isOpen
      ? editing
        ? await projectFoldersEditingProject({
            project,
            tableId,
            fieldId,
            rowId,
            pathname,
            activeNodeArray,
            openNodes,
          })
        : await tableNodesEditingData({
            project,
            tableId,
            rowId,
            activeNodeArray,
            openNodes,
            addOpenNodes,
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

  addOpenNodes(projectNodes.map((n) => n.activeNodeArray))

  return { id: 'root', children: projectNodes }
}

export default buildTree
