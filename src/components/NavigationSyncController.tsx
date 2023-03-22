import { useContext, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import isEqual from 'lodash/isEqual'
import { useLocation, useNavigate } from 'react-router-dom'

import storeContext from '../storeContext'
import getActiveNodeArrayFromUrl from '../utils/activeNodeArrayFromUrl'
import { IStore } from '../store'

// syncs activeNodeArray with browser navigation
const NavigationSyncController = () => {
  const { pathname } = useLocation()

  const store: IStore = useContext(storeContext)
  const { setActiveNodeArray, setNavigate } = store

  const navigate = useNavigate()
  // enable navigating in store > set this as store value
  // (can't be passed when creating store yet)
  useEffect(() => {
    setNavigate(navigate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // need to update activeNodeArray on every navigation
  useEffect(() => {
    const activeNodeArray = getActiveNodeArrayFromUrl(pathname)

    if (!isEqual(activeNodeArray, store.activeNodeArray?.slice())) {
      // console.log('NavigationSyncController', {
      //   activeNodeArrayFromUrl: activeNodeArray,
      //   activeNodeArrayFromStore: store.activeNodeArray?.slice(),
      // })
      setActiveNodeArray(activeNodeArray)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, setActiveNodeArray, store.activeNodeArray])

  return null
}

export default observer(NavigationSyncController)
