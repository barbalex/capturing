import { TileLayer, useMap, WMSTileLayer } from 'react-leaflet'
import styled from 'styled-components'
import { useMapEvent } from 'react-leaflet'

import { TileLayer as TileLayerType } from '../../../../dexieClient'
import WMS from './LeafletWms'

const StyledTileLayer = styled(TileLayer)`
  ${(props) =>
    props.greyscale == 1 &&
    `.leaflet-tile-container {
    filter: grayscale(100%) !important;
  }`}
`
const StyledWMSTileLayer = styled(WMSTileLayer)`
  ${(props) =>
    props.greyscale == 1 &&
    `.leaflet-tile-container {
    filter: grayscale(100%) !important;
  }`}
`

type Props = {
  layer: TileLayerType
}
const TileLayerComponent = ({ layer }: Props) => {
  useMapEvent('click', (e) => {
    console.log('clicked', e)
  })
  if (layer.type === 'url_template') {
    return (
      <StyledTileLayer
        url={layer.url_template}
        maxNativeZoom={19}
        minZoom={layer.min_zoom}
        maxZoom={layer.max_zoom}
        greyscale={layer.greyscale}
        opacity={layer.opacity}
      />
    )
  } else {
    return (
      // <WMS layer={layer} />
      <StyledWMSTileLayer
        url={layer.wms_base_url}
        layers={layer.wms_layers}
        version={layer.wms_version}
        format={layer.wms_format}
        minZoom={layer.min_zoom}
        maxZoom={layer.max_zoom}
        greyscale={layer.greyscale}
        opacity={layer.opacity}
        transparent={layer.wms_transparent === 1}
      />
    )
  }
}

export default TileLayerComponent
