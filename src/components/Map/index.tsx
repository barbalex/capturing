import { useContext, useRef, useCallback } from 'react'
import 'leaflet'
import 'proj4'
import 'proj4leaflet'
import { MapContainer } from 'react-leaflet'
import styled from '@emotion/styled'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import { getSnapshot } from 'mobx-state-tree'
import { useResizeDetector } from 'react-resize-detector'
import { observer } from 'mobx-react-lite'
import { useParams } from 'react-router-dom'

import storeContext from '../../storeContext'
import ErrorBoundary from '../shared/ErrorBoundary'
import LocationMarker from './LocationMarker'
import MapFetcher from './MapFetcher'
import MapZoomFetcher from './MapZoomFetcher'
import DrawControl from './DrawControl'
import TableLayers from './TableLayers'
import TileLayers from './TileLayers'
import VectorLayers from './VectorLayers'
// import ZhUepWfs from './layers/zh_uep_wfs'
import Control from './Control'
import OwnControls from './OwnControls'

import '../../utils/leaflet.dexie/index.ts'
import { IStore } from '../../store'

const Container = styled.div`
  height: 100%;
`
const StyledMapContainer = styled(MapContainer)`
  height: calc(100%);
  .leaflet-control-container {
    user-select: none !important;
  }

  .leaflet-div-icon {
    background: rgba(0, 0, 0, 0);
    border: none;
  }

  .grayscale {
    filter: grayscale(1);
  }

  @media print {
    height: 100%;
    width: 100%;
    overflow: visible;
  }

  @media print {
    .leaflet-control-container {
      display: none !important;
    }
  }
`

/**
 * TODO:
 * enforce re-render when any geometry of any row of any table changes
 */

const MapComponent = () => {
  const { rowId } = useParams()
  const store: IStore = useContext(storeContext)
  const {
    bounds: boundsRaw,
    showMap,
    tileLayerSorter,
    vectorLayerSorter,
  } = store
  const bounds = getSnapshot(boundsRaw)

  const mapRef = useRef()
  const onResize = useCallback(() => {
    if (!showMap) return
    mapRef.current?.leafletElement?.invalidateSize()
  }, [showMap])
  const { ref } = useResizeDetector({
    onResize,
    refreshMode: 'debounce',
    refreshRate: 300,
    refreshOptions: { trailing: true },
  })

  // console.log('Map rendering')

  /**
   * TODO:
   * on move/zoom/whatever setBounds
   */
  /**
   * TODO:
   * map all tables and add GeoJSON layers
   */

  return (
    <ErrorBoundary>
      <Container ref={ref}>
        <StyledMapContainer
          maxZoom={22}
          minZoom={0}
          bounds={bounds}
          ref={mapRef}
          attributionControl={false}
        >
          {/* <ZhUepWfs /> */}
          <LocationMarker />
          <MapFetcher />
          <MapZoomFetcher />
          {!!rowId && <DrawControl />}
          <TableLayers />
          <VectorLayers key={`${vectorLayerSorter}/vectorLayers`} />
          <TileLayers key={`${tileLayerSorter}/tileLayers`} />
          <Control position="topright" visible={true}>
            <OwnControls />
          </Control>
        </StyledMapContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(MapComponent)
