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
    console.log('restarting fetch stream due to visibility changes', store)
    startStream() //going visible, start stopped stream
  }
}

const fetchFromServer = (store) => {
  document.addEventListener('visibilitychange', visibilityListener)

  startStream(store)
}

const startStream = async (store) => {
  console.log('fetchFromServer starting stream')
  hiddenError = false
  processTable({ table: 'projects', store, hiddenError })
  processTable({ table: 'accounts', store, hiddenError })
  processTable({ table: 'field_types', store, hiddenError })
  processTable({ table: 'fields', store, hiddenError })
  processTable({ table: 'files', store, hiddenError })
  processTable({ table: 'news', store, hiddenError })
  processTable({ table: 'news_delivery', store, hiddenError })
  processTable({ table: 'option_types', store, hiddenError })
  processTable({ table: 'project_tile_layers', store, hiddenError })
  processTable({ table: 'project_users', store, hiddenError })
  processTable({ table: 'rel_types', store, hiddenError })
  processTable({ table: 'role_types', store, hiddenError })
  processTable({ table: 'rows', store, hiddenError })
  processTable({ table: 'tables', store, hiddenError })
  processTable({ table: 'tile_layers', store, hiddenError })
  processTable({ table: 'users', store, hiddenError })
  processTable({ table: 'version_types', store, hiddenError })
  processTable({ table: 'widget_types', store, hiddenError })
  processTable({ table: 'widgets_for_fields', store, hiddenError })
}

export default fetchFromServer
