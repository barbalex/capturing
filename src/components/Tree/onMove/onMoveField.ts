import { dexie, Field } from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'

const onMoveField = async ({ idMoved, folderDroppedIn, endIndex }) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const urlArray = folderDroppedIn.split('/')
  const tableId = urlArray[0]

  // 1. get list
  const fields: Field[] = await dexie.fields
    .where({ deleted: 0, table_id: tableId })
    .sortBy('sort')
  // 2. get index of dragged pvl
  const startIndex = fields.findIndex((pvl) => pvl.id === idMoved)
  // 3. return if moved node was not pvl
  if (startIndex === undefined) return
  // 4. re-order array
  const result = Array.from(fields)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  // 5. set sort value according to index in list if it has changed
  const fieldsToUpdate = []
  for (const [index, res] of result.entries()) {
    const sort = index + 1
    const field = fields.find((field) => field.id === res.id)
    if (field.sort !== sort) {
      // update sort value
      const was = { ...field }
      const is = { ...field, sort }
      fieldsToUpdate.push(is)
      field.updateOnServer({
        was,
        is,
        session,
      })
    }
  }
  // push in bulk to reduce re-renders via liveQuery
  await dexie.fields.bulkPut(fieldsToUpdate)
  return
}

export default onMoveField
