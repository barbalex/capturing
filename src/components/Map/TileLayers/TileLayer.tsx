import { TileLayer, WMSTileLayer } from 'react-leaflet'
import styled from 'styled-components'

import { TileLayer as TileLayerType } from '../../../dexieClient'

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
  if (layer.type === 'url_template') {
    return (
      <StyledTileLayer
        url={layer.url_template}
        maxNativeZoom={19}
        minZoom={layer.min_zoom}
        maxZoom={layer.max_zoom}
        greyscale={layer.greyscale}
      />
    )
  } else {
    return (
      <StyledWMSTileLayer
        url={layer.wms_base_url}
        layers={layer.wms_layers}
        version={layer.wms_version}
        format={layer.wms_format}
        minZoom={layer.min_zoom}
        maxZoom={layer.max_zoom}
        greyscale={layer.greyscale}
      />
    )
  }
}

export default TileLayerComponent
