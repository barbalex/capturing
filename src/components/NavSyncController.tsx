import { useContext, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import isEqual from 'lodash/isEqual'
import { useLocation, useNavigate } from 'react-router-dom'

import storeContext from '../storeContext'
import getActiveNodeArrayFromUrl from '../utils/activeNodeArrayFromUrl'

const NavSyncController = () => {
  const { pathname } = useLocation()

  const navigate = useNavigate()
  // enable navigating in store > set this as store value
  // (can't be passed when creating store yet)
  useEffect(() => {
    setNavigate(navigate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const store = useContext(storeContext)
  const { setActiveNodeArray, setNavigate } = store

  // need to update activeNodeArray on every navigation
  useEffect(() => {
    const activeNodeArray = getActiveNodeArrayFromUrl(pathname)
    // console.log('NavSync, location changed:', {
    //   pathname,
    //   activeNodeArrayFromUrl: activeNodeArray,
    // })
    if (!isEqual(activeNodeArray, store.activeNodeArray.slice())) {
      // console.log(`NavSync, navigating due to changed location`, {
      //   activeNodeArrayFromUrl: activeNodeArray,
      //   activeNodeArrayFromStore: store.activeNodeArray.slice(),
      // })
      setActiveNodeArray(activeNodeArray)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, setActiveNodeArray, store.activeNodeArray])

  return null
}

export default observer(NavSyncController)
