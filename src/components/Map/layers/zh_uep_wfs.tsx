import { useEffect, useState } from 'react'
import { GeoJSON, useMapEvent } from 'react-leaflet'
import axios from 'redaxios'
import XMLViewer from 'react-xml-viewer'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import { MdClose } from 'react-icons/md'
import styled from 'styled-components'

const customTheme = {
  attributeKeyColor: '#0074D9',
  attributeValueColor: '#2ECC40',
}

const StyledXMLViewer = styled(XMLViewer)`
  font-size: small;
`
const StyledDialogContent = styled(DialogContent)`
  padding-top: 0;
`

const ZhUepWfs = () => {
  const map = useMapEvent('zoomend', () => {
    console.log('ZhUepWfs zoomend, zoom:', map.getZoom())
    setZoom(map.getZoom())
  })
  useMapEvent('moveend', () => {
    console.log('ZhUepWfs moveend')
    setBounds(map.getBounds())
  })
  const [error, setError] = useState()
  const [data, setData] = useState()
  const [zoom, setZoom] = useState(map.getZoom())
  const [bounds, setBounds] = useState(map.getBounds())

  // const bbox = `${bounds._northEast.lng},${bounds._northEast.lat},${bounds._southWest.lng},${bounds._southWest.lat}`
  const bbox = `${bounds._southWest.lng},${bounds._southWest.lat},${bounds._northEast.lng},${bounds._northEast.lat}`

  const filterOrig = `<Filter><BBOX><PropertyName>ms:ogd-0075_afv_gv_radwege_l</PropertyName><gml:Box srsName='EPSG:4326'><coordinates>${bounds._southWest.lng},${bounds._southWest.lat} ${bounds._northEast.lng},${bounds._northEast.lat}</coordinates></gml:Box></BBOX></Filter>`

  const filter = `<ogc:Filter><ogc:BBOX><gml:Box srsName="EPSG:4326"><gml:coordinates decimal="." cs="," ts=" ">${bounds._southWest.lng},${bounds._southWest.lat} ${bounds._northEast.lng},${bounds._northEast.lat}</gml:coordinates></gml:Box></ogc:BBOX></ogc:Filter>`

  const filterCQL = `BBOX(the_geom, ${bounds._northEast.lng}, ${bounds._northEast.lat}, ${bounds._southWest.lng}, ${bounds._southWest.lat})`

  // const filterDifferent = `<Filter><Within><PropertyName>ms:ogd-0075_afv_gv_radwege_l<PropertyName><gml:Envelope><gml:lowerCorner>${bounds._southWest.lng} -${bounds._southWest.lat}</gml:lowerCorner><gml:upperCorner>${bounds._northEast.lng} -${bounds._northEast.lat}</gml:upperCorner></gml:Envelope></Within></Filter>`

  useEffect(() => {
    const run = async () => {
      if (zoom < 9) return
      let res
      try {
        res = await axios({
          method: 'get',
          // url: 'https://maps.zh.ch/wfs/OGDZHWFS',
          url: 'https://ows.geo.tg.ch/geofy_access_proxy/vernetzungskorridore',
          params: {
            service: 'WFS',
            version: '2.0.0',
            // version: '1.1.0',
            // version: '2.0', // use to provoke error
            request: 'GetFeature',
            // typenames:
            //   'ms:ogd-0075_afv_gv_radwege_l,ms:ogd-0410_arv_basis_avzh_rohrleitungen_l',
            // typename: 'ms:ogd-0410_arv_basis_avzh_rohrleitungen_l',
            // typeName: 'ms:ogd-0075_afv_gv_radwege_l',
            typeName: 'ms:vernetz',
            // typeName: 'poi_aussichtspunkt_view',
            // typename: 'ms:ogd-0346_giszhpub_dtmzh_hoehen_2017_l', // does not work?
            // typename: 'ms:ogd-0119_giszhpub_feuchtgebietinv_79_90_beob_p', // does not work?
            srsName: 'EPSG:4326',
            // outputFormat: 'application/json; subtype=geojson',
            // outputFormat: 'application/json',
            outputFormat: 'GEOJSON',
            // cql_filter: filterCQL,
            // filter,
            bbox,
          },
          // dataType: 'jsonp',
        })
      } catch (error) {
        // error can also be caused by timeout
        // console.log(`ZhUepWfs error:`, error.data)

        setError(error.data)
        return false
      }
      setData(res.data)
    }
    run()
  }, [bbox])

  console.log('ZhUepWfs, data:', data)

  // TODO: add name of layer to title
  // TODO: get styling from layer_styles
  return (
    <>
      {zoom > 8 && (
        <GeoJSON
          key={data ? 1 : 0}
          data={data}
          // style={{
          //   color: 'red',
          //   stroke: 10,
          //   weight: 1,
          //   opacity: 1,
          //   fill: 1,
          //   fillColor: 'red',
          // }}
        />
      )}
      <Dialog
        onClose={() => setError(null)}
        open={!!error}
        fullWidth
        maxWidth="xl"
      >
        <DialogTitle>Error fetching data for vector layer</DialogTitle>
        <IconButton
          aria-label="schliessen"
          title="schliessen"
          onClick={() => setError(null)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <MdClose />
        </IconButton>
        <StyledDialogContent>
          <StyledXMLViewer xml={error} theme={customTheme} />
        </StyledDialogContent>
      </Dialog>
    </>
  )
}

export default ZhUepWfs
