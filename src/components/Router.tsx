import { Routes, Route } from 'react-router-dom'

import Home from '../routes/Home'
import Docs from '../routes/Docs'
import User from '../routes/User'
import ImageLayerTypes from './Docs/ImageLayerTypes'
import OfflineMaps from './Docs/OfflineMaps'
import DataSynchronisation from './Docs/DataSynchronisation'
import DataVersioning from './Docs/DataVersioning'
import DataHistory from './Docs/DataHistory'
import ProjectsPage from '../routes/Projects'
import FourOhFour from '../routes/404'
import ProjectsComponent from './Projects'
import ProjectComponent from './Project'
import TablesComponent from './Tables'
import TableComponent from './Table'
import TileLayersComponent from './TileLayers'
import TileLayerComponent from './TileLayer'
import VectorLayersComponent from './VectorLayers'
import VectorLayerComponent from './VectorLayer'
import FieldsComponent from './Fields'
import FieldComponent from './Field'
import RowsComponent from './Rows'
import RowComponent from './Row'
import Layout from './Layout'
import QueuedUpdates from '../routes/QueuedUpdates'

const RouterComponent = (): React.FC => (
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="user" element={<User />} />
      <Route path="projects/*" element={<ProjectsPage />}>
        <Route index element={<ProjectsComponent />} />
        <Route path=":projectId" element={<ProjectComponent />} />
        <Route path=":projectId/tables" element={<TablesComponent />} />
        <Route path=":projectId/tables/:tableId" element={<TableComponent />} />
        <Route
          path=":projectId/tile-layers"
          element={<TileLayersComponent />}
        />
        <Route
          path=":projectId/tile-layers/:tileLayerId"
          element={<TileLayerComponent />}
        />
        <Route
          path=":projectId/vector-layers"
          element={<VectorLayersComponent />}
        />
        <Route
          path=":projectId/vector-layers/:vectorLayerId"
          element={<VectorLayerComponent />}
        />
        <Route
          path=":projectId/tables/:tableId/fields"
          element={<FieldsComponent />}
        />
        <Route
          path=":projectId/tables/:tableId/fields/:fieldId"
          element={<FieldComponent />}
        />
        <Route
          path=":projectId/tables/:tableId1/rows"
          element={<RowsComponent level={1} />}
        />
        <Route
          path=":projectId/tables/:tableId1/rows/:rowId1"
          element={<RowComponent level={1} />}
        />
        <Route
          path=":projectId/tables/:tableId1/rows/:rowId1/tables/:tableId2"
          element={<RowsComponent level={2} />}
        />
        <Route
          path=":projectId/tables/:tableId1/rows/:rowId1/tables/:tableId2/rows"
          element={<RowsComponent level={2} />}
        />
        <Route
          path=":projectId/tables/:tableId1/rows/:rowId1/tables/:tableId2/rows/:rowId2"
          element={<RowComponent level={2} />}
        />
        <Route path="*" element={<FourOhFour />} />
      </Route>
      <Route path="queued-updates/*" element={<QueuedUpdates />} />
      <Route path="docs/*" element={<Docs />}>
        <Route index element={null} />
        <Route path="image-layer-types" element={<ImageLayerTypes />} />
        <Route path="offline-maps" element={<OfflineMaps />} />
        <Route path="data-synchronization" element={<DataSynchronisation />} />
        <Route path="data-versioning" element={<DataVersioning />} />
        <Route path="data-history" element={<DataHistory />} />
        <Route path="*" element={<FourOhFour />} />
      </Route>
      <Route path="*" element={<FourOhFour />} />
    </Route>
  </Routes>
)

export default RouterComponent
