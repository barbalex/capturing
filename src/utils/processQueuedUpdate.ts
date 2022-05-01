import { supabase } from '../supabaseClient'
import { Session } from '@supabase/supabase-js'
import { dexie, QueuedUpdate } from '../dexieClient'
import { v1 as uuidv1 } from 'uuid'
import SparkMD5 from 'spark-md5'

const revTables = ['rows', 'files_meta']

type ProcessQueuedUpdateProps = { queuedUpdate: QueuedUpdate; store: any }

// TODO: test rev table
// TODO: test regular table

const processQueuedUpdate = async ({
  queuedUpdate,
  store,
}: ProcessQueuedUpdateProps) => {
  const session: Session = supabase.auth.session()
  const { online, setOnline } = store
  // console.log('processQueuedUpdate', queuedUpdate)

  const isRevTable = revTables.includes(queuedUpdate.table)
  const isInsert = !queuedUpdate.revert_id
  // insert _rev or upsert regular table
  if (isRevTable) {
    const revTableName =
      queuedUpdate.table === 'rows' ? 'row_revs' : 'files_meta_revs'
    // queuedUpdate.table.replace(/.$/, '_revs') // https://stackoverflow.com/a/36630251/712005
    // 1 create revision
    const newObject = JSON.parse(queuedUpdate.value)
    const id = newObject.id
    const depth = isInsert ? 1 : newObject.depth + 1
    delete newObject.id
    delete newObject.conflicts
    delete newObject.file
    const newRevObject = {
      ...newObject,
      client_rev_at: new window.Date().toISOString(),
      client_rev_by: session.user?.email ?? session.user?.id,
      depth,
      parent_rev: newObject?.revisions?.[0] ?? null,
    }
    if (queuedUpdate.table === 'rows') newRevObject[`row_id`] = id
    const rev = `${depth}-${SparkMD5.hash(JSON.stringify(newRevObject))}`
    newRevObject.rev = rev
    newRevObject.id = uuidv1()
    newRevObject.revisions = isInsert
      ? [rev]
      : [rev, ...(newObject.revisions ?? [])]

    console.log('processQueuedUpdate, newRevObject:', {
      newRevObject,
      newObject: JSON.parse(queuedUpdate.value),
    })
    // 2. send revision to server
    const { error } = await supabase.from(revTableName).insert(newRevObject)
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
      .upload(`files/${JSON.parse(queuedUpdate.value).id}`, queuedUpdate.file)
    if (error) return console.log(error)
  } else {
    // TODO: upsert regular table
    // 1. create new Object
    const newObject = {
      ...JSON.parse(queuedUpdate.value),
      client_rev_at: new window.Date().toISOString(),
      client_rev_by: session.user.email,
    }
    // 2. send revision to server
    const { error } = await supabase.from(queuedUpdate.table).upsert(newObject)
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
