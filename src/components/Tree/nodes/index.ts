import { dexie, Project } from '../../../dexieClient'
import sortProjectsByLabelName from '../../../utils/sortProjectsByLabelName'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'
import isNodeOpen from '../../../utils/isNodeOpen'
import tableNodesEditingData from './editingData/tableNodes'
import projectFoldersEditingProject from './editingProject/projectFolders'

const buildNodes = async ({
  projectId,
  tableId,
  rowId,
  fieldId,
  editingProjects,
  activeNodeArray,
  nodes,
}) => {
  const projects: Project[] = await dexie.projects
    .where({ deleted: 0 })
    .sortBy('', sortProjectsByLabelName)

  const projectNodes = []
  for (const project of projects) {
    const isOpen = isNodeOpen({ nodes, url: ['projects', project.id] })
    const childrenCount = await dexie.ttables
      .where({ deleted: 0, project_id: project.id })
      .count()
    const editing = editingProjects[project.id]?.editing ?? false
    const children = editing
      ? await projectFoldersEditingProject({
          project,
          tableId,
          fieldId,
          rowId,
          activeNodeArray,
          nodes,
        })
      : await tableNodesEditingData({
          project,
          tableId,
          rowId,
          activeNodeArray,
          nodes,
        })
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
      isOpen, // TODO: what for?
      children,
      childrenCount,
    }
    projectNodes.push(node)
  }

  return { id: 'root', children: projectNodes }
}

export default buildNodes
