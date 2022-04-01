import { useEffect, useState, useContext } from 'react'
// import Head from 'next/head'
// import Image from 'next/image'
import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'

import StoreContext from '../storeContext'
import { supabase } from '../supabaseClient'
import Auth from './Auth'
import Account from './Account'
// import { Accounts } from '../types'

// TODO: ensure authenticated

const Projects = () => {
  const store = useContext(StoreContext)
  const { activeNodeArray, setActiveNodeArray } = store

  const router = useRouter()

  const [session, setSession] = useState(null)

  // TODO: add this effect to all pages
  // need to update activeNodeArray on every navigation
  useEffect(
    () => setActiveNodeArray(activeNodeArray, 'nonavigate'),
    [activeNodeArray, router.pathname, setActiveNodeArray],
  )

  useEffect(() => {
    setSession(supabase.auth.session())

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

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
      {session ? <Account key={session.user.id} session={session} /> : <Auth />}
    </div>
  )
}

export default observer(Projects)
