import { useContext, useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { observer } from 'mobx-react-lite'

import StoreContext from '../storeContext'
import { supabase } from '../supabaseClient'
import Auth from './Auth'
import { Account } from './Account'
// import { Accounts } from '../types'

const Home = () => {
  const [session, setSession] = useState(null)

  useEffect(() => {
    setSession(supabase.auth.session())

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  const store = useContext(StoreContext)
  const [projects, setProjects] = useState([])
  useEffect(() => {
    const run = async () => {
      const { data } = await supabase
        .from<field_types>('field_types')
        .select('*')
      setProjects(data)
    }
    run()
  }, [])
  // console.log('Home', {
  //   field_types: projects,
  //   dexieClient: db,
  //   storeDexie: store.db,
  // })

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      {!session ? (
        <Auth />
      ) : (
        <Account key={session.user.id} session={session} />
      )}
    </div>
  )
}

export default observer(Home)
