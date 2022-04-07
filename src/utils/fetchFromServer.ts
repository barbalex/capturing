import { supabase } from '../supabaseClient'
import { db, db as dexie, IProject } from '../dexieClient'

// per table:
// 1. get last_updated_at from dexie
// 2. subscribe for changes and update dexie with changes from subscription
//    Deal with subscription problems due to: 1. internet outage 2. app moving to background 3. power saving mode
//    see: https://github.com/supabase/supabase/discussions/5641
// 3. fetch all with newer last_updated_at
// 4. update dexie with these changes

/**
 * would be great to do this inside a worker
 * see: https://github.com/dexie/Dexie.js/issues/789
 * example: https://github.com/dexie/Dexie.js/issues/789#issuecomment-458876237
 * Try to use https://github.com/GoogleChromeLabs/import-from-worker (deals with firefox problems?)
 * also see: https://stackoverflow.com/questions/44118600/web-workers-how-to-import-modules
 * problems:
 * 1. does not work on firefox: https://github.com/dexie/Dexie.js/issues/789#issuecomment-963486500
 * 2. can lead to problems on version upgrades: https://github.com/dexie/Dexie.js/issues/789#issuecomment-1080767512
 */

const fallbackRevAt = '1970-01-01T00:01:0.0Z'
let hiddenError = false

function visibilityListener() {
  if (document.visibilityState === 'visible' && hiddenError) {
    console.log('restarting fetch stream due to visibility changes')
    startStream() //going visible, start stopped stream
  }
}

const fetchFromServer = () => {
  document.addEventListener('visibilitychange', visibilityListener)

  startStream()
}

const startStream = async () => {
  hiddenError = false
  // 1. projects
  // 1.1. get last_updated_at from dexie
  const lastProject = await db.projects
    .orderBy('server_rev_at')
    .reverse()
    .first()
  console.log('ServerSubscriber, last project in dexie:', lastProject)
  const projectsLastUpdatedAt = lastProject?.server_rev_at ?? fallbackRevAt
  // 1.2. subscribe for changes and update dexie with changes from subscription
  supabase
    .from('projects')
    .on('*', (payload) => {
      console.log('projectsSubscription', payload)
      dexie.projects.put(payload.new)
    })
    .subscribe((status) => {
      console.log('projectsSubscription, status:', status)
      if (status === 'SUBSCRIPTION_ERROR') {
        if (document.visibilityState === 'hidden') {
          // page visible so let realtime reconnect and reload data
          supabase.removeAllSubscriptions()
          hiddenError = true
        }
      }
    })
  // 1.3. fetch all with newer last_updated_at
  const { data: projectsData, error: projectsError } = await supabase
    .from<IProject>('projects')
    .select('*')
    .gte('server_rev_at', projectsLastUpdatedAt)
  if (projectsError) {
    console.log(
      'ServerSubscriber, error fetching projects from supabase:',
      projectsError,
    )
  }
  console.log(
    'ServerSubscriber, last projects fetched from supabase:',
    projectsData,
  )
  // 1.4. update dexie with these changes
  if (projectsData) {
    // TODO:
    // use https://dexie.org/docs/Table/Table.bulkPut()
    try {
      await dexie.projects.bulkPut(projectsData)
    } catch (error) {
      console.log('error putting projects:', error)
    }
  }
}

export default fetchFromServer
