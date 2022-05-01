import { useMemo, useContext, useEffect, useRef, useCallback } from 'react'
import 'leaflet'
import 'proj4'
import 'proj4leaflet'
import { MapContainer } from 'react-leaflet'
import styled from 'styled-components'
import 'leaflet/dist/leaflet.css'
import { getSnapshot } from 'mobx-state-tree'
import { useResizeDetector } from 'react-resize-detector'
import { useDebouncedCallback } from 'use-debounce'

import storeContext from '../../storeContext'
import ErrorBoundary from '../shared/ErrorBoundary'
import OsmColor from './layers/OsmColor'
import OsmBw from './layers/OsmBw'
import LocationMarker from './LocationMarker'

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

const MapComponent = () => {
  const store = useContext(storeContext)
  const { activeBaseLayer, bounds: boundsRaw, showMap } = store
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

  const BaseLayerComponents = useMemo(
    () => ({
      OsmColor: () => <OsmColor />,
      OsmBw: () => <OsmBw />,
      // SwissTopoPixelFarbe: () => <SwissTopoPixelFarbe />,
      // SwissTopoPixelGrau: () => <SwissTopoPixelGrau />,
      // SwisstopoSiegfried: () => <SwisstopoSiegfried />,
      // SwisstopoDufour: () => <SwisstopoDufour />,
      // ZhUep: () => <ZhUep />,
      // BingAerial: () => <BingAerial />,
      // ZhOrthoAktuellRgb: () => <ZhOrthoAktuellRgb />,
      // ZhOrthoAktuellIr: () => <ZhOrthoAktuellIr />,
      // ZhOrtho2018Rgb: () => <ZhOrtho2018Rgb />,
      // ZhOrtho2018Ir: () => <ZhOrtho2018Ir />,
      // ZhOrtho2015Rgb: () => <ZhOrtho2015Rgb />,
      // ZhOrtho2015Ir: () => <ZhOrtho2015Ir />,
      // ZhOrtho2014Rgb: () => <ZhOrtho2014Rgb />,
      // ZhOrtho2014Ir: () => <ZhOrtho2014Ir />,
    }),
    [],
  )
  const BaseLayerComponent = BaseLayerComponents[activeBaseLayer]
  // console.log('Map', { activeBaseLayer, BaseLayerComponent })

  /**
   * TODO:
   * on move/zoom/whatever setBounds
   */

  return (
    <ErrorBoundary>
      <Container ref={ref}>
        <StyledMapContainer
          maxZoom={22}
          minZoom={0}
          bounds={bounds}
          ref={mapRef}
        >
          {activeBaseLayer && <BaseLayerComponent />}
          <LocationMarker />
        </StyledMapContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default MapComponent
