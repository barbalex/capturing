// import Head from 'next/head'
// import Image from 'next/image'
import { observer } from 'mobx-react-lite'
import Link from 'next/link'

import MyErrorBoundary from '../components/shared/ErrorBoundary'

const Home = () => {
  return (
    <MyErrorBoundary>
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
