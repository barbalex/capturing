import type { AppProps } from 'next/app'

import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'

import materialTheme from '../modules/materialTheme'
import '../styles/globals.css'
import MobxStore from '../store'
import { Provider as MobxProvider } from '../storeContext'

function MyApp({ Component, pageProps }: AppProps) {
  const store = MobxStore.create()
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
