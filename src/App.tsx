import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import MobxStore from './store'
import initiateApp from './utils/initiateApp'
import materialTheme from './utils/materialTheme'
import { Provider as MobxProvider } from './storeContext'
import Home from './routes/Home'
import Docs from './routes/Docs'
import Projects from './routes/Projects'
import Account from './routes/Account'
import FourOhFour from './routes/404'
import Layout from './components/Layout'
import Notifications from './components/Notifications'

function App() {
  console.log('App rendering')
  const store = MobxStore.create()
  // TODO: initiate app
  // detect type = recovery to open reset password modal
  if (typeof window !== 'undefined') {
    const urlSearchParams = new URLSearchParams(window.location.search)
    const params = Object.fromEntries(urlSearchParams.entries())
    if (params?.type === 'recovery') {
      console.log('Layout, setting resetPassword to true')
      return store.setResetPassword(true)
    }
  }

  return (
    <BrowserRouter>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={materialTheme}>
          <MobxProvider value={store}>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="docs" element={<Docs />} />
                <Route path="projects" element={<Projects />} />
                <Route path="account" element={<Account />} />
                <Route path="*" element={<FourOhFour />} />
              </Routes>
            </Layout>
            <Notifications />
          </MobxProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </BrowserRouter>
  )
}

export default App
