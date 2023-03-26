import { useEffect, useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'

import StoreContext from '../storeContext'
import Login from '../components/Login'
import constants from '../utils/constants'
import { IStore } from '../store'

const Container = styled.div`
  min-height: calc(100vh - ${constants.appBarHeight}px);
  position: relative;
`

const ProjectsPage = (): React.FC => {
  const store: IStore = useContext(StoreContext)
  const { session, sessionCounter } = store

  useEffect(() => {
    document.title = 'Erfassen: Projekte'
  }, [])

  // console.log('Projects, session:', { session, sessionCounter })

  if (!session || sessionCounter === 0) return <Login />

  return <Container>TODO</Container>
}

export default observer(ProjectsPage)
