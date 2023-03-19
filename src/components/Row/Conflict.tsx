import React, { useCallback, useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useQuery } from 'react-query'
import styled from '@emotion/styled'

import { supabase } from '../../supabaseClient'
import { Row } from '../../dexieClient'
import StoreContext from '../../storeContext'
import Conflict from '../shared/Conflict'
import createDataArrayForRevComparison from './createDataArrayForRevComparison'
import checkForOnlineError from '../../utils/checkForOnlineError'
import { IStore } from '../../store'

const ErrorContainer = styled.div`
  padding: 25px;
`

type Props = {
  rev: string
  row: Row
  setActiveConflict: () => void
}

const RowConflict = ({ rev, row, setActiveConflict }: Props) => {
  const store: IStore = useContext(StoreContext)
  const { session } = store

  const { isLoading, isError, error, data } = useQuery(
    ['row_revs', 'conflicts', row.id, rev],
    async () => {
      const { error, data } = await supabase
        .from('row_revs')
        .select()
        .match({ row_id: row.id, rev })
        .single()

      if (error) throw error

      const dataArray = await createDataArrayForRevComparison({
        row: data,
        revRow: row,
      })

      return { revRow: data, dataArray }
    },
  )

  error && checkForOnlineError({ error, store })

  const revRow = data?.revRow
  const dataArray = data?.dataArray

  // console.log('RowConflict', { row, rev, setActiveConflict, revRow, dataArray })

  const onClickAktuellUebernehmen = useCallback(async () => {
    // means: rid conflicting revision, i.e. append new revision which is deleted
    // build new object
    const was = undefined
    const is = { ...revRow, deleted: 1 }
    await row.updateOnServer({
      was,
      is,
      session,
      isConflictDeletion: true,
      conflictToRemove: revRow.rev,
    })
    setActiveConflict(null)
  }, [revRow, row, session, setActiveConflict])
  const onClickWiderspruchUebernehmen = useCallback(async () => {
    // need to attach to the winner, that is row
    // otherwise risk to still have lower depth and thus loosing
    const was = row
    const revData = {
      table_id: revRow.table_id,
      geometry: revRow.geometry,
      data: revRow.data,
      deleted: revRow.deleted,
    }
    const is = { ...row, ...revData }
    await row.updateOnServer({ was, is, session, conflictToRemove: row.rev })
    // now we need to delete the previous conflict
    onClickAktuellUebernehmen()
    setActiveConflict(null)
  }, [
    onClickAktuellUebernehmen,
    revRow?.data,
    revRow?.deleted,
    revRow?.geometry,
    revRow?.table_id,
    row,
    session,
    setActiveConflict,
  ])
  const onClickSchliessen = useCallback(
    () => setActiveConflict(null),
    [setActiveConflict],
  )

  console.log('Event Conflict', { dataArray, row, revRow })
  if (isError) return <ErrorContainer>{error.message}</ErrorContainer>

  return (
    <Conflict
      rev={rev}
      dataArray={dataArray}
      loading={isLoading}
      error={error}
      onClickAktuellUebernehmen={onClickAktuellUebernehmen}
      onClickWiderspruchUebernehmen={onClickWiderspruchUebernehmen}
      onClickSchliessen={onClickSchliessen}
    />
  )
}

export default observer(RowConflict)
