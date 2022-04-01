// import Head from 'next/head'
// import Image from 'next/image'
import { observer } from 'mobx-react-lite'
import Link from 'next/link'

const Home = () => {
  return (
    <div>
      <div>home</div>
      <Link href="/Account">
        <a>Account</a>
      </Link>
      <br />
      <Link href="/Projects">
        <a>Projects</a>
      </Link>
    </div>
  )
}

export default observer(Home)
