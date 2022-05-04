import React, { useContext, useCallback } from 'react'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import {
  MdCloudDone as NetworkOn,
  MdCloudOff as NetworkOff,
} from 'react-icons/md'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import storeContext from '../../../storeContext'
import { dexie } from '../../../dexieClient'

const OnlineButton = styled(IconButton)`
  /*cursor: default !important;*/
`
const StyledBadge = styled(Badge)`
  .MuiBadge-badge {
    background-color: rgba(0, 0, 0, 0);
  }
`

const ServerConnected = () => {
  const store = useContext(storeContext)
  // serverConnected not so helpful
  const { online } = store

  const queuedUpdatesCount: integer = useLiveQuery(
    async () => await dexie.queued_updates.count(),
  )
  // if (queuedUpdatesCount >= 0) {
  //   console.log('ServerConnected, queuedUpdatesCount:', queuedUpdatesCount)
  // }
  const showQueuedQueries = 'TODO!'
  const setShowQueuedQueries = useCallback(() => {
    // TODO:
  }, [])
  const title = online
    ? 'Sie sind mit dem Server verbunden'
    : queuedUpdatesCount
    ? `Der Server ist nicht verbunden. ${queuedUpdatesCount} wartende Operationen`
    : `Der Server ist nicht verbunden`

  // TODO:
  // 1. add menu to link to info
  // 2. add menu to list and edit pending queries
  const onClick = useCallback(() => {
    setShowQueuedQueries(!showQueuedQueries)
  }, [showQueuedQueries, setShowQueuedQueries])

  return (
    <OnlineButton
      color="inherit"
      aria-label={title}
      title={title}
      onClick={onClick}
    >
      <StyledBadge color="primary" badgeContent={queuedUpdatesCount} max={999}>
        {online ? <NetworkOn /> : <NetworkOff />}
      </StyledBadge>
    </OnlineButton>
  )
}

export default observer(ServerConnected)
