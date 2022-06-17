import React, { useContext, useCallback, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FaHistory } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../storeContext'
import ErrorBoundary from './ErrorBoundary'
import { dexie, Row } from '../../dexieClient'

const StyledMenuItem = styled(MenuItem)`
  ${(props) =>
    props['data-disabled'] && 'color: rgba(0, 0, 0, 0.54) !important;'}
  ${(props) => props['data-disabled'] && 'cursor: not-allowed !important;'}
`
const StyledIconButton = styled(IconButton)`
  box-sizing: border-box;
  ${(props) =>
    props['data-active'] && 'background-color: rgba(0, 0, 0, 0.04) !important;'}
  ${(props) =>
    props['data-active'] &&
    'box-shadow:inset 0px 0px 0px 1px rgba(0, 0, 0, 0.04);'}
`

const HistoryButton = ({ asMenu, id, showHistory, setShowHistory, table }) => {
  const { rowId } = useParams()
  const store = useContext(StoreContext)
  const { online } = store

  const row: Row =
    useLiveQuery(async () => await dexie.rows.get(rowId), [rowId]) ?? {}

  const existMultipleRevisions =
    !!row?.revisions?.length && row?.revisions?.length > 1
  const disabled = !online || !existMultipleRevisions

  console.log('HistoryButton', {
    row,
    disabled,
    existMultipleRevisions,
    online,
  })

  const show = useCallback(() => {
    if (disabled) return
    setShowHistory(!showHistory)
  }, [disabled, setShowHistory, showHistory])

  const title = online
    ? showHistory
      ? 'Frühere Versionen ausblenden'
      : 'Frühere Versionen anzeigen'
    : 'Frühere Versionen sind nur online verfügbar'

  if (asMenu) {
    return (
      <StyledMenuItem onClick={show} data-disabled={disabled}>
        {title}
      </StyledMenuItem>
    )
  }

  return (
    <ErrorBoundary>
      <StyledIconButton
        aria-label={title}
        title={title}
        onClick={show}
        disabled={disabled}
        data-active={showHistory}
      >
        <FaHistory />
      </StyledIconButton>
    </ErrorBoundary>
  )
}

export default observer(HistoryButton)
