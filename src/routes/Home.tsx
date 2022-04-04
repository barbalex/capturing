import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import styled from 'styled-components'

import MyErrorBoundary from '../components/shared/ErrorBoundary'

const Body = styled.div`
  padding: 8px;
`

const Home = () => {
  useEffect(() => {
    document.title = 'Capturing: Home'
  }, [])

  return (
    <MyErrorBoundary>
      <Body>
        <p>home</p>
      </Body>
    </MyErrorBoundary>
  )
}

export default observer(Home)
