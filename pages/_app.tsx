import { useEffect, useState, useRef } from 'react'
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
  const firstRender = useRef(true)

  console.log('_app rendering', {
    queryType: router.query?.type,
    firstRender: firstRender.current,
  })

  const store = MobxStore.create()

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      initiateApp({ store, router })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
