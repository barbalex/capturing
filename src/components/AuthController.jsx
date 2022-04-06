import { useEffect, useContext } from 'react'
import { observer } from 'mobx-react-lite'

import StoreContext from '../storeContext'
import { supabase } from '../supabaseClient'

// TODO: ensure authenticated

const AuthController = () => {
  const store = useContext(StoreContext)
  const { setSession } = store

  useEffect(() => {
    setSession(supabase.auth.session())

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [setSession])

  return null
}

export default observer(AuthController)
