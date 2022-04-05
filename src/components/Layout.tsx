import { useContext, useEffect } from 'react'
import styled from 'styled-components'
import { useResizeDetector } from 'react-resize-detector'
import { observer } from 'mobx-react-lite'
import isEqual from 'lodash/isEqual'
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom'

import storeContext from '../storeContext'
import Header from './Header'
import constants from '../utils/constants'
import ResetPassword from './ResetPassword'
import getActiveNodeArrayFromUrl from '../utils/activeNodeArrayFromUrl'

const Container = styled.div`
  height: 100%;
  width: 100%;
`

const Layout = ({ children }) => {
  const { width, ref: resizeRef } = useResizeDetector()
  const location = useLocation()
  const { pathname } = location

  const navigate = useNavigate()
  // enable navigating in store > set this as store value
  // (can't be passed when creating store yet)
  useEffect(() => {
    setNavigate(navigate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // detect type = recovery to open reset password modal
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams()
  const resetPassword = searchParams.get('type') === 'recovery'

  const store = useContext(storeContext)
  const {
    singleColumnView,
    setSingleColumnView,
    setActiveNodeArray,
    setNavigate,
  } = store

  console.log('Layout')

  // navigate to potentially new activeNodeArray after restoring store
  // can't do it in App.tsx/initateApp
  // because navigate can't be loaded in App.tsx without messing with rendering
  useEffect(() => {
    const currentActiveNodeArray = [...store.activeNodeArray.slice()]
    const activeNodeArrayFromUrl = getActiveNodeArrayFromUrl(pathname)
    console.log(
      'Layout, effect to navigate after restoring if aNA is different:',
      {
        activeNodeArrayFromUrl,
        currentActiveNodeArray,
      },
    )
    if (!isEqual(currentActiveNodeArray, activeNodeArrayFromUrl)) {
      console.log(
        'initiateApp, need to navigate to:',
        `/${currentActiveNodeArray.join('/')}`,
      )
      navigate(`/${currentActiveNodeArray.join('/')}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (width > constants?.tree?.minimalWindowWidth && singleColumnView) {
      setSingleColumnView(false)
    }
    if (width < constants?.tree?.minimalWindowWidth && !singleColumnView) {
      setSingleColumnView(true)
    }
  }, [setSingleColumnView, singleColumnView, width])

  // need to update activeNodeArray on every navigation
  useEffect(() => {
    const activeNodeArray = getActiveNodeArrayFromUrl(pathname)
    console.log('Layout, location changed:', {
      pathname,
      activeNodeArrayFromUrl: activeNodeArray,
    })
    if (
      !resetPassword &&
      !isEqual(activeNodeArray, store.activeNodeArray.slice())
    ) {
      console.log(`Layout, navigating due to changed location`, {
        activeNodeArrayFromUrl: activeNodeArray,
        activeNodeArrayFromStore: store.activeNodeArray.slice(),
      })
      setActiveNodeArray(activeNodeArray)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, resetPassword, setActiveNodeArray, store.activeNodeArray])

  return (
    <Container ref={resizeRef}>
      <Header />
      {resetPassword && <ResetPassword />}
      {children}
    </Container>
  )
}

export default observer(Layout)
