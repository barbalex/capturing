import styled from 'styled-components'

import constants from '../../utils/constants'

export const Container = styled.div`
  padding: 0 8px 8px 8px;
  overflow: auto;
  height: calc(100vh - ${constants.appBarHeight}px);
`

const ImageLayerTypes = () => {
  return (
    <Container>
      <h1>Image Layer Types</h1>

      <p>
        Web map servers use different technologies to deliver maps. The
        following are most common:
      </p>

      <h3>1. WMS: Web Map Service</h3>
      <p>
        WMS is an{' '}
        <a
          href="https://www.ogc.org/standards/wms"
          target="_blank"
          rel="noreferrer"
        >
          official standard
        </a>
        , defined by the Open Geospatial Consortium.
      </p>
      <p>A WMS-Server returns a single map image for the requested region.</p>

      <h3>2. WMTS: Web Map Tiling Service</h3>
      <p>
        WMS is an{' '}
        <a
          href="https://www.ogc.org/standards/wmts"
          target="_blank"
          rel="noreferrer"
        >
          official standard
        </a>
        , defined by the Open Geospatial Consortium.
      </p>
      <p>
        A WMTS-Server returns multiple (image-)tiles for the requested region
        and depending on the map zoom.
      </p>
      <p>This is advantageous in certain situations. For instance:</p>
      <ul>
        <li>When a map is panned. Only the missing tiles need to be fetched</li>
        <li>
          Tiles can be cached and reloaded offline much better than WMS images
        </li>
      </ul>

      <h3>3. TMS: Tiled Map Service</h3>
      <p>
        TMS is not an official standard. It existed before WMTS and may still be
        used by some map servers.
      </p>
      <p>
        TMS is similar to WMTS in that it returns (image-)tiles for the
        requested region.
      </p>
      <p>
        Unlike WMTS it can not query capabilites, legends or feature-info. Thus
        configuring a TMS-Layer can not be automated.
      </p>
      <p>
        TMS is not implemented in erfassen but could be added. Please tell us if
        you need it.
      </p>
    </Container>
  )
}

export default ImageLayerTypes
