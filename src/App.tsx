import { useEffect, useState } from 'react'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { BrowserRouter } from 'react-router-dom'
import { onSnapshot } from 'mobx-state-tree'
import isEqual from 'lodash/isEqual'
import { QueryClient, QueryClientProvider } from 'react-query'

import { MobxStore } from './store'
import materialTheme from './utils/materialTheme'
import { Provider as MobxProvider } from './storeContext'
import Layout from './components/Layout'
import Notifications from './components/Notifications'
import { dexie } from './dexieClient'
import activeNodeArrayFromUrl from './utils/activeNodeArrayFromUrl'
import NavigationSyncController from './components/NavigationSyncController'
import ResetPassword from './components/ResetPassword'
import ColumnController from './components/ColumnController'
import QueuedUpdatesWriter from './components/QueuedUpdatesWriter'
import { supabase } from './supabaseClient'
import fetchFromServer from './utils/fetchFromServer'
import ApiDetector from './components/ApiDetector'
import RouterComponent from './components/Router'

const queryClient = new QueryClient()

// persisting indexedDB: https://dexie.org/docs/StorageManager#controlling-persistence
// TODO: consider calling this only if user choose it in settings
// or pop own window to explain as shown in above link
// because it pops a request window
async function persist() {
  return (
    (await navigator.storage) &&
    navigator.storage.persist &&
    navigator.storage.persist()
  )
}

function App() {
  const [store, setStore] = useState()
  useEffect(() => {
    // on first render regenerate store (if exists)
    dexie.stores.get('store').then((dbStore) => {
      let st
      if (dbStore) {
        // reset some values
        if (!dbStore?.store?.showMap) dbStore.store.mapInitiated = false
        dbStore.store.notifications = {}
        dbStore.store.session = undefined
        dbStore.store.sessionCounter = 0
        st = MobxStore.create(dbStore?.store)
      } else {
        st = MobxStore.create()
      }
      setStore(st)
      fetchFromServer(st)
      // navigate to previous activeNodeArray - if exists
      const shouldNavigate =
        dbStore?.activeNodeArray?.length &&
        !isEqual(
          activeNodeArrayFromUrl(window.location.pathname),
          dbStore?.activeNodeArray,
        )
      if (shouldNavigate) {
        window.location.href = `${
          window.location.origin
        }/${dbStore?.activeNodeArray?.join('/')}`
      }
      // persist store on every snapshot
      onSnapshot(st, (ss) => dexie.stores.put({ id: 'store', store: ss }))
      // refresh session
      supabase.auth.refreshSession()
      supabase.auth.onAuthStateChange((event, session) => {
        st.setSession(session)
        st.incrementSessionCounter()
      })
    })

    return () => {
      supabase.removeAllChannels()
    }
  }, [])

  useEffect(() => {
    persist().then((val) => console.log('storage is persisted safely:', val))
  }, [])

  // console.log('App rendering, store:', store)

  // on first render returns null
  if (!store) return null

  // on second render returns app with regenerated store
  return (
    <BrowserRouter>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={materialTheme}>
          <MobxProvider value={store}>
            <QueryClientProvider client={queryClient}>
              <NavigationSyncController />
              <ColumnController />
              <ResetPassword />
              <QueuedUpdatesWriter />
              <ApiDetector />
              <Layout>
                <RouterComponent />
              </Layout>
              <Notifications />
            </QueryClientProvider>
          </MobxProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </BrowserRouter>
  )
}

export default App
