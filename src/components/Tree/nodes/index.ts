import { dexie, Project } from '../../../dexieClient'
import sortProjectsByLabelName from '../../../utils/sortProjectsByLabelName'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'
import tableNodesEditingData from './editingData/tableNodes'
import projectFoldersEditingProject from './editingProject/projectFolders'

const buildNodes = async ({
  projectId,
  tableId,
  rowId,
  fieldId,
  editingProjects,
  pathname,
  activeNodeArray,
  nodes,
  addNodes,
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
    const children = editing
      ? await projectFoldersEditingProject({
          project,
          tableId,
          fieldId,
          rowId,
          pathname,
          activeNodeArray,
          nodes,
        })
      : await tableNodesEditingData({
          project,
          tableId,
          rowId,
          activeNodeArray,
          nodes,
          addNodes,
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
      isOpen: true, // TODO: what for?
      children,
      childrenCount,
    }
    projectNodes.push(node)
  }

  const _projectNodes = projectNodes.map((n) => n.activeNodeArray)
  // add tableFolders only if project is in activeNodeArray
  const _tableFolderNodes = projectNodes
    .filter((n) => activeNodeArray.includes(n.id))
    .map((n) => [...n.activeNodeArray, 'tables'])
  addNodes([..._projectNodes, ..._tableFolderNodes])

  return { id: 'root', children: projectNodes }
}

export default buildNodes
