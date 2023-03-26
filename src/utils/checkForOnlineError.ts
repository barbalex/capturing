import { IStoreSnapshotOut } from '../store'
interface Props {
  error: PostgrestError
  store?: IStoreSnapshotOut
}

const checkForOnlineError = ({ error, store }: Props): void => {
  if (!store) return
  if (error.message.includes('Failed to fetch')) {
    console.log('checkForOnlineError, network is failing')
    store.setShortTermOnline(false)
    return
  }
}

export default checkForOnlineError
