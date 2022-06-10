import { TileLayer } from 'react-leaflet'
import styled from 'styled-components'

import { TileLayer as TileLayerType } from '../../../../dexieClient'

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
const WMTS = ({ layer }: Props) => {
  return (
    <StyledTileLayer
      url={layer.wmts_url_template}
      maxNativeZoom={19}
      minZoom={layer.min_zoom}
      maxZoom={layer.max_zoom}
      greyscale={layer.greyscale}
      opacity={layer.opacity}
    />
  )
}

export default WMTS
