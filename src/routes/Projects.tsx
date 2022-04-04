import { useEffect, useState, useContext } from 'react'
import { observer } from 'mobx-react-lite'

import StoreContext from '../storeContext'
import { supabase } from '../supabaseClient'
import Auth from './Auth'
import Account from './Account'
import Login from '../components/Login'
// import { Accounts } from '../types'

// TODO: ensure authenticated

const Projects = () => {
  const store = useContext(StoreContext)
  const { setSession, session } = store

  useEffect(() => {
    document.title = 'Capturing: Projects'
  }, [])

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
      {session ? (
        <Account key={session.user.id} session={session} />
      ) : (
        <Login />
      )}
    </div>
  )
}

export default observer(Projects)
