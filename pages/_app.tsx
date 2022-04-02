import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { useRouter } from 'next/router'
import Head from 'next/head'

import materialTheme from '../utils/materialTheme'
import '../globals.css'
import MobxStore from '../store'
import { Provider as MobxProvider } from '../storeContext'
import activeNodeArrayFromUrl from '../utils/activeNodeArrayFromUrl'
import Layout from '../components/Layout'

function MyApp({ Component, pageProps }: AppProps) {
  const store = MobxStore.create()
  const { activeNodeArrayAsUrl, setActiveNodeArray } = store
  const router = useRouter()
  const { pathname } = router

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
      const activeNodeArray = activeNodeArrayFromUrl(url)
      console.log(
        `_app. url = ${url}. setting activeNodeArray to ${activeNodeArray}. typeof aNA: ${typeof activeNodeArray}`,
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
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={materialTheme}>
        <MobxProvider value={store}>
          <Head>
            <title>Capturing</title>
          </Head>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </MobxProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default MyApp
