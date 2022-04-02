// import Head from 'next/head'
// import Image from 'next/image'
import { observer } from 'mobx-react-lite'
import Link from 'next/link'
import Head from 'next/head'

import MyErrorBoundary from '../components/shared/ErrorBoundary'

const Home = () => {
  return (
    <MyErrorBoundary>
      <Head>
        <title>Capturing: Home</title>
      </Head>
      <div>home</div>
      <Link href="/account">
        <a>Account</a>
      </Link>
      <br />
      <Link href="/projects">
        <a>Projects</a>
      </Link>
    </MyErrorBoundary>
  )
}

export default observer(Home)
