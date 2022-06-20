import React, { useCallback, useMemo } from 'react'
import SparkMD5 from 'spark-md5'
import { Session } from '@supabase/supabase-js'

import History from '../../shared/History'
import createDataArrayForRevComparison from '../../../utils/createDataArrayForRevComparison'
import { supabase } from '../../../supabaseClient'
import { dexie, QueuedUpdate } from '../../../dexieClient'

// TODO: what to do with rtf fields?
const HistoryRow = ({ row, revRow, restoreCallback }) => {
  const session: Session = supabase.auth.session()

  const dataArray = useMemo(
    () => createDataArrayForRevComparison({ row, revRow }),
    [revRow, row],
  )

  const onClickRestore = useCallback(() => {
    // need to attach to the winner, that is row
    // otherwise risk to still have lower depth and thus loosing
    const depth = row.depth + 1
    const revData = {
      row_id: row.id,
      table_id: revRow.table_id,
      parent_id: revRow.parent_id,
      geometry: revRow.geometry,
      data: revRow.data,
      depth,
      parent_rev: row.rev,
      deleted: revRow.deleted,
      client_rev_at: new window.Date().toISOString(),
      client_rev_by: session.user?.email ?? session.user?.id,
    }
    const rev = `${depth}-${SparkMD5.hash(JSON.stringify(revData))}`
    revData.rev = rev
    revData.revisions = [rev, ...(row.revisions ?? [])]
    const update = new QueuedUpdate(
      undefined,
      undefined,
      'rows',
      JSON.stringify(revData),
      undefined,
      row.id,
      JSON.stringify(row),
    )
    restoreCallback()
    dexie.queued_updates.add(update)
    const localUpdate = { ...revData }
    localUpdate.id = row.id
    delete localUpdate.row_id
    // conflicts have not changed
    localUpdate.conflicts = row.conflicts
    return dexie.rows.update(this.id, localUpdate)
  }, [
    restoreCallback,
    revRow.data,
    revRow.deleted,
    revRow.geometry,
    revRow.parent_id,
    revRow.table_id,
    row,
    session.user?.email,
    session.user?.id,
  ])

  return (
    <History
      rev={revRow.rev}
      dataArray={dataArray}
      onClickRestore={onClickRestore}
    />
  )
}

export default HistoryRow
