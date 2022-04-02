import { useEffect, useState, useContext } from 'react'
import { observer } from 'mobx-react-lite'
import Head from 'next/head'

import StoreContext from '../storeContext'
import { supabase } from '../supabaseClient'
import Auth from './auth'
import Account from './account'
import Login from '../components/Login'
// import { Accounts } from '../types'

// TODO: ensure authenticated

const Projects = () => {
  const store = useContext(StoreContext)
  const { setSession, session } = store

  useEffect(() => {
    setSession(supabase.auth.session())

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [setSession])

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
  console.log('Home, session:', { session, userId: session?.user?.id })

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      <Head>
        <title>Capturing: Projects</title>
      </Head>
      {session ? (
        <Account key={session.user.id} session={session} />
      ) : (
        <Login />
      )}
    </div>
  )
}

export default observer(Projects)
