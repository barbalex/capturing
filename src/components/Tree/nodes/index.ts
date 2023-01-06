// import { getSnapshot } from 'mobx-state-tree'

import { dexie, Project } from '../../../dexieClient'
import sortProjectsByLabelName from '../../../utils/sortProjectsByLabelName'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'
import tableNodesEditingData from './editingData/tables'
import projectFoldersEditingProject from './editingProject/projectFolders'

const buildNodes = async ({
  rowId,
  tableId,
  tableId2,
  rowId2,
  editingProjects,
  nodes,
}) => {
  const projects: Project[] = await dexie.projects
    .where({ deleted: 0 })
    .sortBy('', sortProjectsByLabelName)

  const projectNodes = []
  for (const project of projects) {
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
          tableId,
          tableId2,
          rowId2,
          nodes,
        })
    const childrenCount = editing
      ? 3
      : await dexie.ttables
          .where({ deleted: 0, project_id: project.id })
          .count()

    // console.log('buildNodes', {
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
      children,
      childrenCount,
    }
    projectNodes.push(node)
  }

  // console.log('buildNodes', { projectNodes })

  return projectNodes
}

export default buildNodes
