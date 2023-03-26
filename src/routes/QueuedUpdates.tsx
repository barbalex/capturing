import { useEffect, useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'

import StoreContext from '../storeContext'
import Login from '../components/Login'
import constants from '../utils/constants'
import { IStoreSnapshotOut } from '../store'

const Container = styled.div`
  min-height: calc(100vh - ${constants.appBarHeight}px);
  position: relative;
`

const QueuedUpdatesComponent = (): React.FC => {
  const store: IStoreSnapshotOut = useContext(StoreContext)
  const { session, sessionCounter } = store

  useEffect(() => {
    document.title = 'Erfassen: Warteschlange'
  }, [])

  // console.log('Projects, session:', { session, sessionCounter })

  if (!session || sessionCounter === 0) return <Login />

  return <Container>TODO</Container>
}

export default observer(QueuedUpdatesComponent)
