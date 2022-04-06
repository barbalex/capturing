import { db as dexie } from '../dexieClient'
import { supabase } from '../supabaseClient'

const logout = async ({ store }) => {
  // do everything to clean up so no data is left
  await supabase.auth.signOut()
  await dexie.delete()
  // TODO: destroy store
  // TODO: need to re-fetch / recreate store
  return
}

export default logout
