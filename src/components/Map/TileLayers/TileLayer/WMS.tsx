import { useMap, WMSTileLayer } from 'react-leaflet'
import styled from 'styled-components'
import { useMapEvent } from 'react-leaflet'
import axios from 'redaxios'
import * as ReactDOMServer from 'react-dom/server'

import xmlToLayersData from '../../../../utils/xmlToLayersData'
import WMSPopup from './Popup'

const StyledWMSTileLayer = styled(WMSTileLayer)`
  ${(props) =>
    props.greyscale == 1 &&
    `.leaflet-tile-container {
    filter: grayscale(100%) !important;
  }`}
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

const WMS = ({ layer }) => {
  const map = useMap()

  useMapEvent('click', async (e) => {
    // console.log({ layer })
    if (layer.wms_queryable === 0) return
    let res
    let failedToFetch = false
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
        info_format: layer.wms_info_format ?? 'application/vnd.ogc.gml',
        // info_format: 'text/plain',
        query_layers: layer.wms_layers,
        x: e.containerPoint.x,
        y: e.containerPoint.y,
        width: mapSize.x,
        height: mapSize.y,
        bbox,
      }
      res = await axios({
        method: 'get',
        url: layer.wms_base_url,
        params,
      })
    } catch (error) {
      // console.log(`error fetching ${row.label}`, error?.toJSON())
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('error.response.data', error.response.data)
        console.log('error.response.status', error.response.status)
        console.log('error.response.headers', error.response.headers)
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log('error.request:', error.request)
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('error.message', error.message)
      }
      if (error.message?.toLowerCase()?.includes('failed to fetch')) {
        failedToFetch = true
      } else {
        return
      }
    }

    // build popup depending on wms_info_format
    let popupContent
    // see for values: https://docs.geoserver.org/stable/en/user/services/wms/reference.html#getfeatureinfo
    if (failedToFetch) {
      popupContent = ReactDOMServer.renderToString(
        <PopupContainer>
          <StyledPopupContent>{`Sie könnten offline sein.\n\nOffline können keine WMS-Informationen\nabgerufen werden.`}</StyledPopupContent>
        </PopupContainer>,
      )
    } else {
      switch (layer.wms_info_format) {
        case 'application/vnd.ogc.gml':
        case 'application/vnd.ogc.gml/3.1.1': {
          const parser = new window.DOMParser()
          const layersData = xmlToLayersData(
            parser.parseFromString(res.data, 'text/html'),
          )

          // do not open empty popups
          if (!layersData.length) return

          popupContent = ReactDOMServer.renderToString(
            <WMSPopup layersData={layersData} />,
          )
          break
        }
        // TODO: test
        case 'text/html': {
          popupContent = (
            <PopupContainer>
              <div dangerouslySetInnerHTML={{ __html: res.data }} />
            </PopupContainer>
          )
          break
        }
        // TODO: test
        case 'application/json':
        case 'text/javascript': {
          // do not open empty popups
          if (!res.data?.length) return
          if (res.data.includes('no results')) return

          popupContent = ReactDOMServer.renderToString(
            <PopupContainer>
              <StyledPopupContent>
                {JSON.stringify(res.data)}
              </StyledPopupContent>
            </PopupContainer>,
          )
          break
        }
        case 'text/plain':
        default: {
          // do not open empty popups
          if (!res.data?.length) return
          if (res.data.includes('no results')) return

          popupContent = ReactDOMServer.renderToString(
            <PopupContainer>
              <StyledPopupContent>{res.data}</StyledPopupContent>
            </PopupContainer>,
          )
          break
        }
      }
    }

    L.popup().setLatLng(e.latlng).setContent(popupContent).openOn(map)
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
