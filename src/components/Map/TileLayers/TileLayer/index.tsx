import { TileLayer } from 'react-leaflet'
import styled from 'styled-components'

import { ProjectTileLayer as TileLayerType } from '../../../../dexieClient'
import WMS from './WMS'

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
  if (layer.type === 'wmts') {
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
    return <WMS layer={layer} />
  }
}

export default TileLayerComponent
