import { ProjectUser } from '../../../dexieClient'

type Props = {
  projectUser: ProjectUser
}

const ProjectUserComponent = ({ projectUser }: Props) => {
  return <div>{`${projectUser.user_email} (${projectUser.role})`}</div>
}

export default ProjectUserComponent
