import { dexie, ProjectUser, QueuedUpdate } from '../dexieClient'

interface Props {
  projectId: string
  email: string
  role: string
}

const insertProjectUser = async ({ projectId, email, role }: Props) => {
  const newProjectUser = new ProjectUser(
    undefined,
    projectId,
    email,
    role,
    undefined,
    undefined,
    undefined,
    undefined,
  )
  const update = new QueuedUpdate(
    undefined,
    undefined,
    'project_users',
    undefined,
    JSON.stringify(newProjectUser),
    undefined,
    undefined,
  )
  await Promise.all([
    dexie.project_users.put(newProjectUser),
    dexie.queued_updates.add(update),
  ])
  return newProjectUser.id
}

export default insertProjectUser
