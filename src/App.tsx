import { useEffect, useState } from 'react'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { onSnapshot } from 'mobx-state-tree'

import MobxStore from './store'
import materialTheme from './utils/materialTheme'
import { Provider as MobxProvider } from './storeContext'
import Home from './routes/Home'
import Docs from './routes/Docs'
import Projects from './routes/Projects'
import Account from './routes/Account'
import FourOhFour from './routes/404'
import Layout from './components/Layout'
import Notifications from './components/Notifications'
import { db as dexie } from './dexieClient'

function App() {
  //const navigate = useNavigate()
  const [store, setStore] = useState()
  useEffect(() => {
    dexie.stores.get('store').then((dbStore) => {
      console.log('App, dbStore gotten from dexie:', dbStore)
      const st = MobxStore.create(dbStore)
      setStore(st)
      onSnapshot(st, (ss) => {
        console.log('App, snapshot:', ss)
        dexie.stores.put({ id: 'store', ...ss })
      })
    })
  }, [])
  console.log('App rendering, store:', store)

  if (!store) return <p>loading</p>

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
