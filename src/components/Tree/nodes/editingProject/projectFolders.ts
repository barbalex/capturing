import buildTableNodes from './tables'
import { dexie } from '../../../../dexieClient'
import isNodeOpen from '../../isNodeOpen'

const projectFoldersEditingProject = async ({ project, rowId, nodes }) => {
  // return if parent does not exist (in nodes)
  if (!isNodeOpen({ nodes, url: ['projects', project.id] })) return []

  const folderNodes = [
    {
      id: `${project.id}/tablesFolder`,
      label: 'Tabellen',
      type: 'projectFolder',
      object: project,
      activeNodeArray: ['projects', project.id, 'tables'],
      isOpen: isNodeOpen({ nodes, url: ['projects', project.id, 'tables'] }),
      children: await buildTableNodes({
        project,
        rowId,
        nodes,
      }),
      childrenCount: await dexie.ttables
        .where({
          deleted: 0,
          project_id: project.id,
        })
        .count(),
    },
  ]

  return folderNodes
}

export default projectFoldersEditingProject
