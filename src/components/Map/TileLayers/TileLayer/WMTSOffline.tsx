import { useEffect } from 'react'
import { TileLayer, useMap } from 'react-leaflet'
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

const WMTSOffline = ({ layer }: Props) => {
  const map = useMap()

  useEffect(() => {
    // TODO:
    // add layer to map
    // remove on return
    const wmtsLayer = L.tileLayer(layer.wmts_url_template, {
      maxNativeZoom: 19,
      minZoom: layer.min_zoom,
      maxZoom: layer.max_zoom,
      greyscale: layer.greyscale,
      opacity: layer.opacity,
    })
    wmtsLayer.addTo(map)

    return () => map.removeLayer(wmtsLayer)
  }, [
    layer.greyscale,
    layer.max_zoom,
    layer.min_zoom,
    layer.opacity,
    layer.wmts_url_template,
    map,
  ])

  return null
}

export default WMTSOffline
