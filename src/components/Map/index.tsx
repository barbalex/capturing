import { useMemo, useContext, useEffect, useRef, useCallback } from 'react'
import 'leaflet'
import 'proj4'
import 'proj4leaflet'
import { MapContainer } from 'react-leaflet'
import styled from 'styled-components'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import { getSnapshot } from 'mobx-state-tree'
import { useResizeDetector } from 'react-resize-detector'

import storeContext from '../../storeContext'
import ErrorBoundary from '../shared/ErrorBoundary'
import OsmColor from './layers/OsmColor'
import OsmBw from './layers/OsmBw'
import LocationMarker from './LocationMarker'
import DrawControl from './DrawControl'
import TableLayers from './TableLayers'
import TileLayers from './TileLayers'

const Container = styled.div`
  height: 100%;
`
const StyledMapContainer = styled(MapContainer)`
  height: calc(100%);
  /* width: calc(100%); */

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
  const store = useContext(storeContext)
  const { bounds: boundsRaw, showMap } = store
  const bounds = getSnapshot(boundsRaw)

  const mapRef = useRef()
  const onResize = useCallback(() => {
    if (!showMap) return
    // console.log('resize detected')
    mapRef.current?.leafletElement?.invalidateSize()
  }, [showMap])
  const { ref } = useResizeDetector({
    onResize,
    refreshMode: 'debounce',
    refreshRate: 300,
    refreshOptions: { trailing: true },
  })

  // console.log('map rendering')

  useEffect(() => {
    console.log('Map initiated')
  }, [])

  console.log('Map rendering')

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
          <LocationMarker />
          <DrawControl />
          <TableLayers />
          <TileLayers />
        </StyledMapContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default MapComponent
