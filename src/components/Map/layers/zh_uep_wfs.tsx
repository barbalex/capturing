import { useEffect, useState } from 'react'
import { GeoJSON } from 'react-leaflet'
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
  const [error, setError] = useState()
  const [data, setData] = useState()
  useEffect(() => {
    const run = async () => {
      let res
      try {
        res = await axios({
          method: 'get',
          url: 'http://maps.zh.ch/wfs/OGDZHWFS',
          params: {
            service: 'WFS',
            version: '2.0.0',
            // version: '2.0', // use to provoke error
            request: 'GetFeature',
            typename: 'ms:ogd-0075_afv_gv_radwege_l',
            srsname: 'EPSG:4326',
            outputFormat: 'application/json; subtype=geojson',
          },
          dataType: 'jsonp',
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
  }, [])

  console.log('ZhUepWfs', { data, error })

  // TODO: add name of layer to title
  // TODO: get styling from layer_styles
  return (
    <>
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
