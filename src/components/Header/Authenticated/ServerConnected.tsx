import React, { useContext, useCallback } from 'react'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import {
  MdCloudDone as NetworkOn,
  MdCloudOff as NetworkOff,
} from 'react-icons/md'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'

import storeContext from '../../../storeContext'

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
  const { serverConnected } = store
  const queuedQueries = 'TODO:'
  const showQueuedQueries = 'TODO!'
  const setShowQueuedQueries = () => {}
  const title = serverConnected
    ? 'Sie sind mit dem Server verbunden'
    : queuedQueries.size
    ? `Der Server ist nicht verbunden. ${queuedQueries.size} wartende Operationen`
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
      <StyledBadge color="primary" badgeContent={queuedQueries.size} max={999}>
        {serverConnected ? <NetworkOn /> : <NetworkOff />}
      </StyledBadge>
    </OnlineButton>
  )
}

export default observer(ServerConnected)
