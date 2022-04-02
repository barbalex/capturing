import { useContext, useEffect } from 'react'
import styled from 'styled-components'
import { useResizeDetector } from 'react-resize-detector'
import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'

import storeContext from '../storeContext'
import Header from './Header'
import constants from '../utils/constants'
import ResetPassword from './ResetPassword'
import activeNodeArrayFromUrl from '../utils/activeNodeArrayFromUrl'

const Container = styled.div`
  height: 100%;
  width: 100%;
`

const Layout = ({ children }) => {
  const { width, ref: resizeRef } = useResizeDetector()
  const router = useRouter()
  const { pathname, query } = router

  const store = useContext(storeContext)
  const {
    singleColumnView,
    setSingleColumnView,
    resetPassword,
    setResetPassword,
    activeNodeArrayAsUrl,
    setActiveNodeArray,
  } = store

  useEffect(() => {
    if (width > constants?.tree?.minimalWindowWidth && singleColumnView) {
      setSingleColumnView(false)
    }
    if (width < constants?.tree?.minimalWindowWidth && !singleColumnView) {
      setSingleColumnView(true)
    }
  }, [setSingleColumnView, singleColumnView, width])

  useEffect(() => {
    // detect type=recovery fragment in url > navigate to password reset form
    console.log('Layout, query from effect:', query)
    if (query?.type === 'recovery') {
      return setResetPassword(true)
    }
    // on first load: if store.activeNodeArray is not home: navigate
    // if (activeNodeArrayAsUrl !== pathname) {
    //   console.log(
    //     `_app, navigating to ${activeNodeArrayAsUrl} because pathname not equal to activeNodeArray. pathname: ${pathname}, activeNodeArray: ${activeNodeArrayAsUrl}`,
    //   )
    //   router.push(activeNodeArrayAsUrl)
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  useEffect(() => {
    // on first load: if store.activeNodeArray is not home: navigate
    if (activeNodeArrayAsUrl !== pathname) {
      console.log(
        `_app, navigating to ${activeNodeArrayAsUrl} because pathname not equal to activeNodeArray. pathname: ${pathname}, activeNodeArray: ${activeNodeArrayAsUrl}`,
      )
      router.push(activeNodeArrayAsUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // need to update activeNodeArray on every navigation
    // https://nextjs.org/docs/api-reference/next/router#routerevents
    const handleRouteChange = (url) => {
      // TODO: need to remove query from url
      const activeNodeArray = activeNodeArrayFromUrl(url.split(/[?#]/)[0])
      console.log(
        `_app. url = ${
          url.split(/[?#]/)[0]
        }. setting activeNodeArray to ${activeNodeArray}. typeof aNA: ${typeof activeNodeArray}`,
      )
      setActiveNodeArray(activeNodeArray, 'nonavigate')
    }

    router.events.on('routeChangeStart', handleRouteChange)

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [router, setActiveNodeArray])

  return (
    <Container ref={resizeRef}>
      <Header />
      {resetPassword && <ResetPassword />}
      {children}
    </Container>
  )
}

export default observer(Layout)
