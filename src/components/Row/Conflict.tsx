import React, { useCallback, useContext, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { useQuery } from 'react-query'
import styled from 'styled-components'

import { supabase } from '../../supabaseClient'
import StoreContext from '../../storeContext'
import Conflict from '../shared/Conflict'
import createDataArrayForRevComparison from './createDataArrayForRevComparison'
import checkForOnlineError from '../../utils/checkForOnlineError'

const ErrorContainer = styled.div`
  padding: 25px;
`

const RowConflict = ({
  rev,
  row,
  setActiveConflict,
}) => {
  const store = useContext(StoreContext)

  const {
    isLoading,
    isError,
    error,
    data: revRow,
  } = useQuery(['row_revs', 'conflicts', row.id, rev], async () => {
    const { error, data } = await supabase
      .from('row_revs')
      .select()
      .match({ row_id: row.id, rev })
      .single()
      .execute()

    if (error) throw error

    return data
  })

  error && checkForOnlineError({ error, store })

  const dataArray = useMemo(
    () => createDataArrayForRevComparison({ row, revRow }),
    [revRow, row],
  )

  const onClickAktuellUebernehmen = useCallback(async () => {
    // build new object
    const was = revRow
    const is = { ...revRow, deleted: true }
    row.updateOnServer({ was, is, session, isConflictDeletion: true })
    setActiveConflict(null)
  }, [revRow, row, setActiveConflict])
  const onClickWiderspruchUebernehmen = useCallback(async () => {
    // need to attach to the winner, that is row
    // otherwise risk to still have lower depth and thus loosing
    const was = row
    const revData = {
      table_id: revRow.table_id,
      parent_id: revRow.parent_id,
      geometry: revRow.geometry,
      data: revRow.data,
      deleted: revRow.deleted,
    }
    const is = { ...row, ...revData }
    row.updateOnServer({ was, is, session })
    // now we need to delete the previous conflict
    onClickAktuellUebernehmen()
    setActiveConflict(null)
  }, [
    onClickAktuellUebernehmen,
    revRow.data,
    revRow.deleted,
    revRow.geometry,
    revRow.parent_id,
    revRow.table_id,
    row,
    setActiveConflict,
  ])
  const onClickSchliessen = useCallback(
    () => setActiveConflict(null),
    [setActiveConflict],
  )

  //console.log('Event Conflict', { dataArray, row, revRow })
  if (isError) return <ErrorContainer>{error.message}</ErrorContainer>

  return (
    <Conflict
      name="Event"
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
