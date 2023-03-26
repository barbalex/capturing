import { NavigateFunction } from 'react-router-dom'
import { dexie } from '../dexieClient'
import { supabase } from '../supabaseClient'
import { IStoreSnapshotOut } from '../store'

interface Props {
  store: IStoreSnapshotOut
  navigate?: NavigateFunction
}

const logout = async ({ store, navigate }: Props) => {
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
