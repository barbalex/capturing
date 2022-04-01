import type { AppProps } from 'next/app'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { createClient } from '@supabase/supabase-js'

import materialTheme from '../modules/materialTheme'
import '../styles/globals.css'
import MobxStore from '../store'
import { Provider as MobxProvider } from '../storeContext'
import { db } from '../modules/initiateDb'

function MyApp({ Component, pageProps }: AppProps) {
  const store = MobxStore.create()
  store.setDb(db)

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
