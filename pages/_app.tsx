import { useEffect, useRef } from 'react'
import type { AppProps } from 'next/app'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import Head from 'next/head'
import { useRouter } from 'next/router'

import materialTheme from '../utils/materialTheme'
import '../globals.css'
import MobxStore from '../store'
import { Provider as MobxProvider } from '../storeContext'
import Layout from '../components/Layout'
import initiateApp from '../utils/initiateApp'

const MyApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()
  // Problem: useRouter makes compenent render twice, see: https://github.com/vercel/next.js/issues/12010
  const renderCount = useRef(0)

  const store = MobxStore.create()
  renderCount.current = renderCount.current + 1

  useEffect(() => {
    if (renderCount.current === 1) {
      initiateApp({ store, router })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let params
  if (typeof window !== 'undefined') {
    const urlSearchParams = new URLSearchParams(window.location.search)
    params = Object.fromEntries(urlSearchParams.entries())
    if (params?.type === 'recovery') {
      console.log('Layout, setting resetPassword')
      return store.setResetPassword(true)
    }
  }

  console.log('_app rendering, renderCount.current:', renderCount.current)

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
