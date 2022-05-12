import { useMap, WMSTileLayer } from 'react-leaflet'
import styled from 'styled-components'
import { useMapEvent } from 'react-leaflet'
import axios from 'redaxios'
import XMLViewer from 'react-xml-viewer'
import * as ReactDOMServer from 'react-dom/server'

import xmlToLayersData from '../../../../utils/xmlToLayersData'

const StyledWMSTileLayer = styled(WMSTileLayer)`
  ${(props) =>
    props.greyscale == 1 &&
    `.leaflet-tile-container {
    filter: grayscale(100%) !important;
  }`}
`
const StyledXMLViewer = styled(XMLViewer)`
  font-size: small;
`
const StyledPopupContent = styled.div`
  white-space: pre;
`
const PopupContainer = styled.div`
  overflow: auto;
  span {
    font-size: x-small !important;
  }
`

const xmlTheme = {
  attributeKeyColor: '#0074D9',
  attributeValueColor: '#2ECC40',
}

const WMS = ({ layer }) => {
  const map = useMap()

  useMapEvent('click', async (e) => {
    console.log({ e })
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
    const popupContent = ReactDOMServer.renderToString(
      <PopupContainer>
        <StyledXMLViewer xml={res.data} theme={xmlTheme} />
      </PopupContainer>,
    )
    // const popupContent = ReactDOMServer.renderToString(
    //   <PopupContainer>
    //     <StyledPopupContent>{res.data}</StyledPopupContent>
    //   </PopupContainer>,
    // )
    const parser = new window.DOMParser()
    console.log(
      'layersData:',
      xmlToLayersData(parser.parseFromString(res.data, 'text/html')),
    )

    const popup = L.popup()
      .setLatLng(e.latlng)
      .setContent(popupContent)
      .openOn(map)
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
