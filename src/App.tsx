import { useEffect, useState } from 'react'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { onSnapshot } from 'mobx-state-tree'
import isEqual from 'lodash/isEqual'
import { QueryClient, QueryClientProvider } from 'react-query'

import { MobxStore } from './store'
import materialTheme from './utils/materialTheme'
import { Provider as MobxProvider } from './storeContext'
import Home from './routes/Home'
import Docs from './routes/Docs'
import User from './routes/User'
import ImageLayerTypes from './components/Docs/ImageLayerTypes'
import OfflineMaps from './components/Docs/OfflineMaps'
import DataSynchronisation from './components/Docs/DataSynchronisation'
import DataVersioning from './components/Docs/DataVersioning'
import DataHistory from './components/Docs/DataHistory'
import ProjectsPage from './routes/Projects'
import FourOhFour from './routes/404'
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
import ProjectsComponent from './components/Projects'
import ProjectComponent from './components/Project'
import TablesComponent from './components/Tables'
import TableComponent from './components/Table'
import TileLayersComponent from './components/TileLayers'
import TileLayerComponent from './components/TileLayer'
import VectorLayersComponent from './components/VectorLayers'
import VectorLayerComponent from './components/VectorLayer'
import FieldsComponent from './components/Fields'
import FieldComponent from './components/Field'
import RowsComponent from './components/Rows'
import RowComponent from './components/Row'

const queryClient = new QueryClient()

// trying to persist indexedDB
// https://dexie.org/docs/StorageManager#controlling-persistence
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
    })

    return () => {
      supabase.removeAllSubscriptions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="docs/*" element={<Docs />}>
                    <Route
                      path="image-layer-types"
                      element={<ImageLayerTypes />}
                    />
                    <Route path="offline-maps" element={<OfflineMaps />} />
                    <Route
                      path="data-synchronization"
                      element={<DataSynchronisation />}
                    />
                    <Route
                      path="data-versioning"
                      element={<DataVersioning />}
                    />
                    <Route path="data-history" element={<DataHistory />} />
                  </Route>
                  <Route path="user" element={<User />} />
                  <Route path="projects/*" element={<ProjectsPage />}>
                    <Route index element={<ProjectsComponent />} />
                    <Route path=":projectId" element={<ProjectComponent />} />
                    <Route
                      path=":projectId/tables/*"
                      element={<TablesComponent />}
                    />
                    <Route
                      path=":projectId/tables/:tableId"
                      element={<TableComponent />}
                    />
                    <Route
                      path=":projectId/tile-layers/*"
                      element={<TileLayersComponent />}
                    />
                    <Route
                      path=":projectId/tile-layers/:tileLayerId"
                      element={<TileLayerComponent />}
                    />
                    <Route
                      path=":projectId/vector-layers/*"
                      element={<VectorLayersComponent />}
                    />
                    <Route
                      path=":projectId/vector-layers/:vectorLayerId"
                      element={<VectorLayerComponent />}
                    />
                    <Route
                      path=":projectId/tables/:tableId/fields/*"
                      element={<FieldsComponent />}
                    />
                    <Route
                      path=":projectId/tables/:tableId/fields/:fieldId"
                      element={<FieldComponent />}
                    />
                    <Route
                      path=":projectId/tables/:tableId/rows/*"
                      element={<RowsComponent />}
                    />
                    <Route
                      path=":projectId/tables/:tableId/rows/:rowId/*"
                      element={<RowComponent />}
                    />
                  </Route>
                  <Route path="*" element={<FourOhFour />} />
                </Routes>
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
