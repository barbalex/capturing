import { useEffect, useState } from 'react'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { onSnapshot } from 'mobx-state-tree'
import isEqual from 'lodash/isEqual'

import { MobxStore } from './store'
import materialTheme from './utils/materialTheme'
import { Provider as MobxProvider } from './storeContext'
import Home from './routes/Home'
import Docs from './routes/Docs'
import ProjectsPage from './routes/Projects'
import Account from './routes/Account'
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
import ProjectTileLayersComponent from './components/ProjectTileLayers'
import ProjectTileLayerComponent from './components/ProjectTileLayer'
import ProjectVectorLayersComponent from './components/ProjectVectorLayers'
import ProjectVectorLayerComponent from './components/ProjectVectorLayer'
import FieldsComponent from './components/Fields'
import FieldComponent from './components/Field'
import RowsComponent from './components/Rows'
import RowComponent from './components/Row'

function App() {
  const [store, setStore] = useState()
  useEffect(() => {
    // on first render regenerate store (if exists)
    dexie.stores.get('store').then((dbStore) => {
      // console.log('App, Effect, store from db:', dbStore)
      const st = MobxStore.create(dbStore?.store)
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
      onSnapshot(st, (ss) => {
        // console.log('App, Effect, snapshot:', ss)
        // TODO: remove from snapshot what should not be persisted (if that exists)
        dexie.stores.put({ id: 'store', store: ss })
      })
    })

    return () => {
      supabase.removeAllSubscriptions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <NavigationSyncController />
            <ColumnController />
            <ResetPassword />
            <QueuedUpdatesWriter />
            <ApiDetector />
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="docs" element={<Docs />} />
                <Route path="projects/*" element={<ProjectsPage />}>
                  <Route index element={<ProjectsComponent />} />
                  <Route
                    path=":projectId"
                    element={<ProjectComponent />}
                  ></Route>
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
                    element={<ProjectTileLayersComponent />}
                  />
                  <Route
                    path=":projectId/tile-layers/:projectTileLayerId"
                    element={<ProjectTileLayerComponent />}
                  />
                  <Route
                    path=":projectId/vector-layers/*"
                    element={<ProjectVectorLayersComponent />}
                  />
                  <Route
                    path=":projectId/vector-layers/:projectVectorLayerId"
                    element={<ProjectVectorLayerComponent />}
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
                    path=":projectId/tables/:tableId/rows/:rowId"
                    element={<RowComponent />}
                  />
                </Route>
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
