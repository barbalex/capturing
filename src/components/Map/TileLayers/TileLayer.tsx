import { TileLayer } from 'react-leaflet'
import styled from 'styled-components'

import { TileLayer as TileLayerType } from '../../../dexieClient'

const StyledTileLayer = styled(TileLayer)`
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
  // TODO: decide whether to use TileLayer or WMSTileLayer
  return (
    <StyledTileLayer
      url={layer.url_template}
      maxNativeZoom={19}
      minZoom={layer.min_zoom}
      maxZoom={layer.max_zoom}
      greyscale={layer.greyscale}
    />
  )
}

export default TileLayerComponent
