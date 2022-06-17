import { v1 as uuidv1 } from 'uuid'
import SparkMD5 from 'spark-md5'

import { dexie, Row, QueuedUpdate } from '../dexieClient'

type InsertRowProps = {
  tableId: string
}

const insertRow = async ({ tableId }: InsertRowProps) => {
  const revData = {
    row_id: uuidv1(),
    table_id: tableId,
    depth: 1,
    deleted: 0,
  }
  const rev = `1-${SparkMD5.hash(JSON.stringify(revData))}`
  const newRow = new Row(
    revData.row_id, // id
    tableId, // table_id
    undefined, // parent_id
    undefined, // geometry
    undefined, // bbox
    undefined, // data
    undefined, // client_rev_at
    undefined, // client_rev_by
    undefined, // server_rev_at
    rev, // rev
    undefined, // parent_rev
    [rev], // revisions
    1, // depth
    0, // deleted
    undefined, // conflicts
  )
  const update = new QueuedUpdate(
    undefined,
    undefined,
    'rows',
    JSON.stringify(newRow),
    undefined,
    undefined,
  )
  await Promise.all([dexie.rows.put(newRow), dexie.queued_updates.add(update)])
  return newRow.id
}

export default insertRow
