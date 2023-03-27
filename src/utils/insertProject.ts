import { dexie, Project, Account, QueuedUpdate } from '../dexieClient'

interface Props {
  account: Account
}

const insertProject = async ({ account }: Props) => {
  const newProject = new Project(
    undefined,
    account?.id,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  )
  const update = new QueuedUpdate(
    undefined,
    undefined,
    'projects',
    undefined,
    JSON.stringify(newProject),
    undefined,
    undefined,
  )
  await Promise.all([
    dexie.projects.put(newProject),
    dexie.queued_updates.add(update),
  ])
  return newProject.id
}

export default insertProject
