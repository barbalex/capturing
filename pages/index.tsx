// import Head from 'next/head'
// import Image from 'next/image'
import { observer } from 'mobx-react-lite'
import Head from 'next/head'

import MyErrorBoundary from '../components/shared/ErrorBoundary'

const Home = () => {
  return (
    <MyErrorBoundary>
      <Head>
        <title>Capturing: Home</title>
      </Head>
      <div>home</div>
    </MyErrorBoundary>
  )
}

export default observer(Home)
