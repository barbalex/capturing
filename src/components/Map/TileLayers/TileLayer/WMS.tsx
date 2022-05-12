import { TileLayer, useMap, WMSTileLayer } from 'react-leaflet'
import styled from 'styled-components'
import { useMapEvent } from 'react-leaflet'

const StyledWMSTileLayer = styled(WMSTileLayer)`
  ${(props) =>
    props.greyscale == 1 &&
    `.leaflet-tile-container {
    filter: grayscale(100%) !important;
  }`}
`

const WMS = ({ layer }) => {
  const map = useMap()

  return (
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

export default WMS
