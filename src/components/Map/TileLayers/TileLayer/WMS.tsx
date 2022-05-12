import { useMap, WMSTileLayer } from 'react-leaflet'
import styled from 'styled-components'
import { useMapEvent } from 'react-leaflet'
import axios from 'redaxios'

const StyledWMSTileLayer = styled(WMSTileLayer)`
  ${(props) =>
    props.greyscale == 1 &&
    `.leaflet-tile-container {
    filter: grayscale(100%) !important;
  }`}
`

const WMS = ({ layer }) => {
  const map = useMap()

  useMapEvent('click', async (e) => {
    let res
    try {
      const mapSize = map.getSize()
      const bounds = map.getBounds()
      const bbox = `${bounds._southWest.lat},${bounds._southWest.lng},${bounds._northEast.lat},${bounds._northEast.lng}`
      const params = {
        service: 'WMS',
        version: layer.wms_version,
        request: 'GetFeatureInfo',
        layers: layer.wms_layers,
        crs: 'EPSG:4326',
        format: layer.wms_format,
        // TODO: let user choose? How to know?
        info_format: 'application/vnd.ogc.gml',
        // info_format: 'text/plain',
        query_layers: layer.wms_layers,
        x: e.containerPoint.x,
        y: e.containerPoint.y,
        width: mapSize.x,
        height: mapSize.y,
        bbox,
      }
      console.log('will call, params:', params)
      res = await axios({
        method: 'get',
        url: layer.wms_base_url,
        params,
      })
    } catch (error) {
      console.log(error)
      return false
    }
    console.log('result from request:', res)
    console.log('data from request:', res.data)
  })

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
