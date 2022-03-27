import type { AppProps } from 'next/app'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider'
import { createClient } from '@supabase/supabase-js'

import materialTheme from '../modules/materialTheme'
import '../styles/globals.css'
import MobxStore from '../store'
import { Provider as MobxProvider } from '../storeContext'
import initiateDb from '../modules/initiateDb'

function MyApp({ Component, pageProps }: AppProps) {
  const store = MobxStore.create()
  const db = initiateDb()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
  console.log({ supabase })

  return (
    <DatabaseProvider database={db}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={materialTheme}>
          <MobxProvider value={store}>
            <Component {...pageProps} />
          </MobxProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </DatabaseProvider>
  )
}

export default MyApp
