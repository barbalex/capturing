import type { AppProps } from 'next/app'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import Head from 'next/head'

import materialTheme from '../utils/materialTheme'
import '../globals.css'
import MobxStore from '../store'
import { Provider as MobxProvider } from '../storeContext'
import Layout from '../components/Layout'

function MyApp({ Component, pageProps }: AppProps) {
  const store = MobxStore.create()
  console.log('_app rendering')

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
