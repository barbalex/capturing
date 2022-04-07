import { supabase } from '../../supabaseClient'
import { db, db as dexie, IProject } from '../../dexieClient'
import processTable from './processTable'

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
  processTable('projects', () => {
    if (status === 'SUBSCRIPTION_ERROR') {
      if (document.visibilityState === 'hidden') {
        // page visible so let realtime reconnect and reload data
        supabase.removeAllSubscriptions()
        hiddenError = true
      }
    }
  })
  processTable('accounts')
  processTable('field_types')
  processTable('fields')
  processTable('files')
  processTable('news')
  processTable('news_delivery')
  processTable('option_types')
  processTable('project_tile_layers')
  processTable('project_users')
  processTable('rel_types')
  processTable('role_types')
  processTable('rows')
  processTable('tables')
  processTable('tile_layers')
  processTable('users')
  processTable('version_types')
  processTable('widget_types')
  processTable('widgets_for_fields')
}

export default fetchFromServer
