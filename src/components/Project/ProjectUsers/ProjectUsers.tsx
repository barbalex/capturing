import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import { dexie, ProjectUser } from '../../../dexieClient'
import ProjectUserComponent from './ProjectUser'

const ProjectUsersComponent = () => {
  const { projectId } = useParams()
  const projectUsers: ProjectUser[] =
    useLiveQuery(
      async () =>
        await dexie.project_users
          .where({ deleted: 0, project_id: projectId })
          .sortBy('user_email'),
    ) ?? []

  return projectUsers.map((u) => (
    <ProjectUserComponent key={u.id} projectUser={u} />
  ))
}

export default ProjectUsersComponent
