import React, { useCallback, useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { FaHistory } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import styled from '@emotion/styled'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../storeContext'
import ErrorBoundary from './ErrorBoundary'
import { dexie, Row } from '../../dexieClient'
import { IStore } from '../../store'

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

interface Props {
  asMenu?: boolean
  showHistory: boolean
  setShowHistory: (value: boolean) => void
  level: number
}

const HistoryButton = ({
  asMenu,
  showHistory,
  setShowHistory,
  level,
}: Props) => {
  const params = useParams()
  const rowId = params[`rowId${level}`]
  const url = params['*']
  const isHistory = url?.endsWith('history')
  const store: IStore = useContext(StoreContext)
  const { online } = store

  const row: Row =
    useLiveQuery(async () => await dexie.rows.get(rowId), [rowId]) ?? {}

  const existMultipleRevisions =
    !!row?.revisions?.length && row?.revisions?.length > 1
  const disabled = !online || !existMultipleRevisions

  const onClick = useCallback(() => {
    setShowHistory(!showHistory)
  }, [setShowHistory, showHistory])

  const title = online
    ? isHistory
      ? 'Frühere Versionen ausblenden'
      : 'Frühere Versionen anzeigen'
    : 'Frühere Versionen sind nur online verfügbar'

  if (asMenu) {
    return (
      <StyledMenuItem onClick={onClick} data-disabled={disabled}>
        {title}
      </StyledMenuItem>
    )
  }

  return (
    <ErrorBoundary>
      <StyledIconButton
        aria-label={title}
        title={title}
        onClick={onClick}
        disabled={disabled}
        data-active={isHistory}
      >
        <FaHistory />
      </StyledIconButton>
    </ErrorBoundary>
  )
}

export default observer(HistoryButton)
