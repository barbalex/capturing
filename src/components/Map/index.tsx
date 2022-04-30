import { useMemo, useContext } from 'react'
import 'leaflet'
import 'proj4'
import 'proj4leaflet'
import { MapContainer } from 'react-leaflet'
import styled from 'styled-components'
import 'leaflet/dist/leaflet.css'
import { getSnapshot } from 'mobx-state-tree'

import storeContext from '../../storeContext'
import ErrorBoundary from '../shared/ErrorBoundary'
import OsmColor from './layers/OsmColor'
import OsmBw from './layers/OsmBw'
import LocationMarker from './LocationMarker'

const StyledMapContainer = styled(MapContainer)`
  height: calc(100%);

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
  const { activeBaseLayer, bounds: boundsRaw } = store
  const bounds = getSnapshot(boundsRaw)
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
  console.log('Map', { activeBaseLayer, BaseLayerComponent })

  /**
   * TODO:
   * on move/zoom/whatever setBounds
   */

  return (
    <ErrorBoundary>
      <StyledMapContainer maxZoom={22} minZoom={0} bounds={bounds}>
        {activeBaseLayer && <BaseLayerComponent />}
        <LocationMarker />
      </StyledMapContainer>
    </ErrorBoundary>
  )
}

export default MapComponent
