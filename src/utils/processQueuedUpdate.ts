import { supabase } from '../supabaseClient'
import { db as dexie, QueuedUpdate } from '../dexieClient'
import { v1 as uuidv1 } from 'uuid'
import md5 from 'blueimp-md5'

const revTables = ['rows', 'files']

type ProcessQueuedUpdateProps = { queuedUpdate: QueuedUpdate }

// TODO: test rev table
// TODO: test regular table

const processQueuedUpdate = async ({
  queuedUpdate,
}: ProcessQueuedUpdateProps) => {
  console.log('processQueuedUpdate', queuedUpdate)
  // TODO: ttables problem?
  const isRevTable = revTables.includes(queuedUpdate.table)
  const singularTableName = queuedUpdate.table.slice(0, -1)
  // insert _rev or upsert regular table
  if (isRevTable) {
    // https://stackoverflow.com/a/36630251/712005
    const revTableName = queuedUpdate.table.replace(/.$/, '_rev')
    const isInsert = !!queuedUpdate.revert_id
    // TODO: insert revision
    // 1 create revision
    const newObject = JSON.parse(queuedUpdate.value)
    const id = newObject.id
    const depth = isInsert ? 1 : newObject.depth + 1
    delete newObject.id
    const newRevObject = {
      [`${singularTableName}_id`]: id,
      ...newObject,
      client_rev_at: new window.Date().toISOString(),
      client_rev_by: session.user.email,
      depth,
      parent_rev: queuedUpdate.revert_value?.rev ?? null,
    }
    const rev = `${_depth}-${md5(JSON.stringify(newRevObject))}`
    newRevObject.rev = rev
    newRevObject.id = uuidv1()
    newObject.revisions = isInsert ? [rev] : [rev, ...newObject.revisions]
    // send revision to server
    try {
      await supabase.from(revTableName).insert(newObject)
    } catch (error) {
      // TODO: if error due to offline, set online to false (error.message.includes('Failed to fetch')?). Return
      // TODO: if error due to auth, renew auth (error.message.includes('JWT')?) and return
      // TODO: if error due to exact same change (same rev): ignore error. Go on to remove update
      //       (lcMessage.includes('uniqueness violation') && lcMessage.includes('_rev_id__rev_key'))
      // TODO: catch error due to uniqueness-violation (lcMessage.includes('unique-constraint'))
      //       inform user, maybe in correct form?. Go on to remove update
      // TODO: else inform user that change can not be written do server. Enable user to delete operation
      // TODO: restore previous value
    }
    // TODO: if works, set online true if false
    // TODO: remove queuedUpdate
    await dexie.queued_updates.delete(queuedUpdate.id)
    return
  }
  // TODO: upsert regular table
  // remove queuedUpdate
  await dexie.queued_updates.delete(queuedUpdate.id)
}

export default processQueuedUpdate
