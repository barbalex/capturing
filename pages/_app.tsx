import type { AppProps } from 'next/app'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider'

import materialTheme from '../modules/materialTheme'
import '../styles/globals.css'
import MobxStore from '../store'
import { Provider as MobxProvider } from '../storeContext'
import initiateDb from '../modules/initiateDb'

function MyApp({ Component, pageProps }: AppProps) {
  const store = MobxStore.create()
  const db = initiateDb()

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
