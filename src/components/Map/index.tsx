import { useMemo, useContext } from 'react'
import 'leaflet'
import 'proj4'
import 'proj4leaflet'
import { MapContainer, useMap } from 'react-leaflet'
import styled from 'styled-components'
import 'leaflet/dist/leaflet.css'

import storeContext from '../../storeContext'
import ErrorBoundary from '../shared/ErrorBoundary'
import OsmColor from './layers/OsmColor'
import OsmBw from './layers/OsmBw'

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
  const { activeBaseLayer } = store
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

  return (
    <ErrorBoundary>
      <StyledMapContainer
        maxZoom={22}
        minZoom={0}
        center={[51.505, -0.09]}
        zoom={13}
      >
        {activeBaseLayer && <BaseLayerComponent />}
      </StyledMapContainer>
    </ErrorBoundary>
  )
}

export default MapComponent
