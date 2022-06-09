import { dexie, Project } from '../../../dexieClient'
import sortProjectsByLabelName from '../../../utils/sortProjectsByLabelName'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'
import isNodeOpen from '../../../utils/isNodeOpen'
import tableNodesEditingData from './editingData/tableNodes'
import projectFoldersEditingProject from './editingProject/projectFolders'

const buildNodes = async ({ rowId, editingProjects, nodes }) => {
  const projects: Project[] = await dexie.projects
    .where({ deleted: 0 })
    .sortBy('', sortProjectsByLabelName)

  const projectNodes = []
  for (const project of projects) {
    const isOpen = isNodeOpen({ nodes, url: ['projects', project.id] })
    const editing = editingProjects[project.id]?.editing ?? false

    const children = editing
      ? await projectFoldersEditingProject({
          project,
          rowId,
          nodes,
        })
      : await tableNodesEditingData({
          project,
          rowId,
          nodes,
        })
    const childrenCount = editing
      ? 3
      : await dexie.ttables
          .where({ deleted: 0, project_id: project.id })
          .count()

    // console.log({
    //   children,
    //   nodes: getSnapshot(nodes),
    //   childrenCount,
    //   editing,
    //   project: project.name,
    // })

    const node = {
      id: project.id,
      label: labelFromLabeledTable({
        object: project,
        useLabels: project.use_labels,
      }),
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
