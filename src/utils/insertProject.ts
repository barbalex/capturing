import { db as dexie, Project, QueuedUpdate } from '../dexieClient'

const insertProject = async ({ account }) => {
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