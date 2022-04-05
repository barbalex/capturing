import { useEffect, useState } from 'react'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { onSnapshot } from 'mobx-state-tree'
import isEqual from 'lodash/isEqual'

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
import activeNodeArrayFromUrl from './utils/activeNodeArrayFromUrl'
import NavSync from './components/NavSync'
import ResetPassword from './components/ResetPassword'
import ColumnController from './components/ColumnController'

function App() {
  const [store, setStore] = useState()
  useEffect(() => {
    // on first render regenerate store (if exists)
    dexie.stores.get('store').then((dbStore) => {
      const st = MobxStore.create(dbStore)
      setStore(st)
      // navigate to previous activeNodeArray - if exists
      const shouldNavigate =
        dbStore?.activeNodeArray?.length &&
        !isEqual(
          activeNodeArrayFromUrl(window.location.pathname),
          dbStore.activeNodeArray,
        )
      if (shouldNavigate) {
        window.location.href = `${
          window.location.origin
        }/${dbStore?.activeNodeArray.join('/')}`
      }
      // persist store on every snapshot
      onSnapshot(st, (ss) => {
        console.log('App, snapshot:', ss)
        dexie.stores.put({ id: 'store', ...ss })
      })
    })
  }, [])
  console.log('App rendering, store:', store)

  // on first render returns null
  if (!store) return null

  // on second render returns app with regenerated store
  return (
    <BrowserRouter>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={materialTheme}>
          <MobxProvider value={store}>
            <NavSync />
            <ColumnController />
            <Layout>
              <ResetPassword />
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
