import { observer } from 'mobx-react-lite'
import Head from 'next/head'
import styled from 'styled-components'

import MyErrorBoundary from '../components/shared/ErrorBoundary'

const Body = styled.div`
  padding: 8px;
`

const Home = () => {
  return (
    <MyErrorBoundary>
      <Head>
        <title>Capturing: Home</title>
      </Head>
      <Body>
        <p>home</p>
      </Body>
    </MyErrorBoundary>
  )
}

export default observer(Home)
