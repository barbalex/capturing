import { useEffect, useState, useContext } from 'react'
// import Head from 'next/head'
// import Image from 'next/image'
import { observer } from 'mobx-react-lite'

import StoreContext from '../storeContext'
// import { Accounts } from '../types'

const Home = () => {
  const store = useContext(StoreContext)

  useEffect(() => {
    // TODO: if store.activeNodeArrayis not home: navigate
  }, [])

  return <div>home</div>
}

export default observer(Home)
