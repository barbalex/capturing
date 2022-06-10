import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

import { TileLayer as TileLayerType } from '../../../../dexieClient'

type Props = {
  layer: TileLayerType
}

const WMTSOffline = ({ layer }: Props) => {
  const map = useMap()

  useEffect(() => {
    const wmtsLayer = L.tileLayer(layer.wmts_url_template, {
      maxNativeZoom: 19,
      minZoom: layer.min_zoom,
      maxZoom: layer.max_zoom,
      greyscale: layer.greyscale,
      className: layer.greyscale ? 'grayscale' : '',
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
