import { supabase } from '../supabaseClient'
import { dexie, QueuedUpdate } from '../dexieClient'

const revTables = ['rows', 'files_meta']

type ProcessQueuedUpdateProps = { queuedUpdate: QueuedUpdate; store: any }

// TODO: test rev table
// TODO: test regular table

const processQueuedUpdate = async ({
  queuedUpdate,
  store,
}: ProcessQueuedUpdateProps) => {
  const { online, setOnline } = store
  console.log('processQueuedUpdate', queuedUpdate)

  const isRevTable = revTables.includes(queuedUpdate.table)
  const object = JSON.parse(queuedUpdate.value)
  // remove all local fields
  const localFields = Object.keys(object).filter((k) => k.startsWith('_'))
  localFields.forEach((field) => delete object[field])
  // TODO: do this separately for rows and files
  // insert _rev or upsert regular table
  if (isRevTable) {
    const revTableName =
      queuedUpdate.table === 'rows' ? 'row_revs' : 'files_meta_revs'
    // 1 create row_rev from row or file_rev from file
    const newRevision = {
      ...object,
    }
    delete newRevision.id
    delete newRevision.conflicts
    delete newRevision.file
    if (queuedUpdate.table === 'rows') newRevision[`row_id`] = object.id

    console.log('processQueuedUpdate, newRevObject:', {
      newRevision,
      object: JSON.parse(queuedUpdate.value),
    })
    // 2. send revision to server
    const { error } = await supabase.from(revTableName).insert(newRevision)
    if (error) {
      // 3. deal with errors
      // TODO: error when updating: "new row violates row-level security policy (USING expression) for table \"projects\""
      console.log(
        'processQueuedUpdate, revision table, error inserting:',
        error,
      )
      // TODO: if error due to offline, set online to false (error.message.includes('Failed to fetch')?). Return
      // TODO: if error due to auth, renew auth (error.message.includes('JWT')?) and return
      // TODO: if error due to exact same change (same rev): ignore error. Go on to remove update
      //       (lcMessage.includes('uniqueness violation') && lcMessage.includes('_rev_id__rev_key'))
      // TODO: catch error due to uniqueness-violation (lcMessage.includes('unique-constraint'))
      //       inform user, maybe in correct form?. Go on to remove update
      // TODO: else inform user that change can not be written do server. Enable user to delete operation
      // TODO: restore previous value
      return
    }
  } else if (queuedUpdate.table === 'files') {
    // send to supabase storage
    console.log('processQueuedUpdate, should process file', { queuedUpdate })
    const { error } = await supabase.storage
      .from('files')
      .upload(`files/${object.id}`, queuedUpdate.file)
    if (error) return console.log(error)
  } else {
    // OPTION: with extra values property could upsert multiple values at once
    // would be good for: pvl_geom
    // upsert regular table
    const { error } = await supabase.from(queuedUpdate.table).upsert(object)
    if (error) {
      // 3. deal with errors
      console.log('processQueuedUpdate, regular table, error upserting:', error)
    }
  }
  // 4. It worked. Clean up
  // Set online true if was false
  if (!online) setOnline(true)
  // remove queuedUpdate
  await dexie.queued_updates.delete(queuedUpdate.id)
}

export default processQueuedUpdate
