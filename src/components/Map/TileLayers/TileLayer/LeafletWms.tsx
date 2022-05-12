import { useEffect } from 'react'
import LWMS from 'leaflet.wms'
import { useMap } from 'react-leaflet'

const WMS = ({ layer: tileLayer }) => {
  const map = useMap()

  useEffect(() => {
    const options = {
      transparent: tileLayer.wms_transparent === 1,
      format: tileLayer.wms_format,
      version: tileLayer.wms_version,
      minZoom: tileLayer.min_zoom,
      maxZoom: tileLayer.max_zoom,
      greyscale: tileLayer.greyscale,
      opacity: tileLayer.opacity,
      className: 'greyscale',
    }
    const MySource = LWMS.Source.extend({
      showFeatureInfo: function (latlng, info) {
        console.log({ info })
      },
    })
    //const source = new MySource(tileLayer.wms_base_url, options)
    const source = LWMS.source(tileLayer.wms_base_url, options)
    const layers = (tileLayer.wms_layers ?? '').split(',')
    for (const layer of layers) {
      source.getLayer(layer).addTo(map)
    }
  }, [map, tileLayer])

  return null
}

export default WMS
