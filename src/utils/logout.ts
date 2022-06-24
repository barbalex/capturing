import { dexie } from '../dexieClient'
import { supabase } from '../supabaseClient'

const logout = async ({ store, navigate }) => {
  // do everything to clean up so no data is left
  await supabase.auth.signOut()
  await dexie.delete()
  // TODO: destroy store
  // TODO: need to re-fetch / recreate store
  // TODO: navigate to home
  navigate && navigate('/')
  return
}

export default logout
