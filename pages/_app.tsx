import type { AppProps } from 'next/app'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { useRouter } from 'next/router'

import materialTheme from '../utils/materialTheme'
import '../styles/globals.css'
import MobxStore from '../store'
import { Provider as MobxProvider } from '../storeContext'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }: AppProps) {
  const store = MobxStore.create()
  const { activeNodeArrayAsUrl, setActiveNodeArray, activeNodeArray } = store
  const router = useRouter()

  useEffect(() => {
    // if store.activeNodeArray is not home: navigate
    if (activeNodeArrayAsUrl !== router.pathname) {
      console.log(
        `_app, navigating to ${activeNodeArrayAsUrl} because pathname not equal to activeNodeArray`,
      )
      router.push(activeNodeArrayAsUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // need to update activeNodeArray on every navigation
    // https://nextjs.org/docs/api-reference/next/router#routerevents
    const handleRouteChange = (url, { shallow }) => {
      console.log(
        `App is changing to ${url} ${
          shallow ? 'with' : 'without'
        } shallow routing > setting activeNodeArray`,
      )
      setActiveNodeArray(activeNodeArray, 'nonavigate')
    }

    router.events.on('routeChangeStart', handleRouteChange)

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [activeNodeArray, router, setActiveNodeArray])

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={materialTheme}>
        <MobxProvider value={store}>
          <Component {...pageProps} />
        </MobxProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default MyApp
