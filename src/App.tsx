import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'

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
  //const navigate = useNavigate()
  const store = MobxStore.create()
  initiateApp({ store })

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
