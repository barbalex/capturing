import { useContext, useEffect } from 'react'
import styled from 'styled-components'
import { useResizeDetector } from 'react-resize-detector'
import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'
import isEqual from 'lodash/isEqual'

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

  const store = useContext(storeContext)
  const {
    singleColumnView,
    setSingleColumnView,
    resetPassword,
    activeNodeArrayAsUrl,
    setActiveNodeArray,
    activeNodeArray,
  } = store

  console.log('Layout', {
    activeNodeArray: activeNodeArray.slice(),
    activeNodeArrayAsUrl,
    resetPassword,
  })

  useEffect(() => {
    if (width > constants?.tree?.minimalWindowWidth && singleColumnView) {
      setSingleColumnView(false)
    }
    if (width < constants?.tree?.minimalWindowWidth && !singleColumnView) {
      setSingleColumnView(true)
    }
  }, [setSingleColumnView, singleColumnView, width])

  useEffect(() => {
    // need to update activeNodeArray on every navigation
    // https://nextjs.org/docs/api-reference/next/router#routerevents
    const handleRouteChange = (url) => {
      // TODO: need to remove query from url
      const activeNodeArray = activeNodeArrayFromUrl(url)
      if (
        !resetPassword &&
        !isEqual(activeNodeArray, store.activeNodeArray.slice())
      ) {
        console.log(`Layout, handleRouteChange`, {
          activeNodeArrayFromUrl: activeNodeArray,
          activeNodeArrayFromStore: store.activeNodeArray.slice(),
          url,
          resetPassword,
        })
        setActiveNodeArray(activeNodeArray, 'nonavigate')
      }
    }

    router.events.on('routeChangeStart', handleRouteChange)

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [resetPassword, router.events, setActiveNodeArray, store.activeNodeArray])

  return (
    <Container ref={resizeRef}>
      <Header />
      {resetPassword && <ResetPassword />}
      {children}
    </Container>
  )
}

export default observer(Layout)
