import { useEffect, useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'

import StoreContext from '../storeContext'
import Login from '../components/Login'
import constants from '../utils/constants'
import { supabase } from '../supabaseClient'
import ErrorBoundary from '../components/shared/ErrorBoundary'

const Container = styled.div`
  min-height: calc(100vh - ${constants.appBarHeight}px);
  position: relative;
`

const UserPage = () => {
  const store = useContext(StoreContext)
  const session = supabase.auth.session()

  // console.log('Projects, mapInitiated:', mapInitiated)

  useEffect(() => {
    document.title = 'Erfassen: Benutzer'
  }, [])

  if (!session) return <Login />

  // console.log('Projects rendering', { initial, animate })

  return (
    <ErrorBoundary>
      <Container>User</Container>
    </ErrorBoundary>
  )
}

export default observer(UserPage)
