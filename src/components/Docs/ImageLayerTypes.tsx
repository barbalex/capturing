import styled from 'styled-components'

const Container = styled.div`
  padding: 0 8px 8px 8px;
`

const ImageLayerTypes = () => {
  return (
    <Container>
      <h1>Image Layer Types</h1>

      <p>
        Web map servers use different technologies to deliver maps. The
        following are most common and can be used in erfassen:
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
        A WMTS-Server returns multiple (image-)tiles for the requested region.
      </p>
      <p>
        This is advantageous in certain situations. For instance when a map is
        panned.
      </p>

      <h3>3. TMS: Tiled Map Service</h3>
      <p>
        TMS is not an official standard. It existed before WMTS and may still be
        used by some map servers.
      </p>
      <p>
        TMS is similar to WMTS in that it returns (image-)tiles for the
        requested region.
      </p>
      <p>Unlike WMTS it can not query capabilites, legends or feature-info.</p>
    </Container>
  )
}

export default ImageLayerTypes
