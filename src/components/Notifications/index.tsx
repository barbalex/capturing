import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import IconButton from '@mui/material/IconButton'
import { MdClose as CloseIcon } from 'react-icons/md'
import sortBy from 'lodash/sortBy'

import { IStore } from '../../store'

// z-index needs to cover map, thus so hight
const Container = styled.div`
  padding: 5px;
  z-index: 500;
  position: absolute;
  bottom: 10px;
  left: 10px;
`
const StyledIconButton = styled(IconButton)`
  margin-left: 5px !important;
`

import StoreContext from '../../storeContext'
import Notification from './Notification'

const Notifications: React.FC = () => {
  const store: IStore = useContext(StoreContext)
  const { removeAllNotifications, notifications } = store

  const notificationsSorted = sortBy([...notifications.values()], 'time')
    .reverse()
    // limit to 4
    .slice(0, 4)

  const onClickClose = useCallback(
    () => removeAllNotifications(),
    [removeAllNotifications],
  )

  const notifObject = notifications.toJSON()

  // console.log('Notifications, notifications', Object.keys(notifObject))

  if (notificationsSorted.length === 0) return null

  return (
    <Container key={Object.keys(notifObject)}>
      {notificationsSorted.map((n) => (
        <Notification key={n.id} notification={n} />
      ))}
      {notificationsSorted.length > 2 && (
        <StyledIconButton
          key="close"
          aria-label="Close"
          color="secondary"
          onClick={onClickClose}
          title="Alle Meldungen schliessen"
          size="small"
          edge="start"
        >
          <CloseIcon />
        </StyledIconButton>
      )}
    </Container>
  )
}

export default observer(Notifications)
