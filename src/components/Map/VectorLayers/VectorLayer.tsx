import { useEffect, useState } from 'react'
import { GeoJSON, useMapEvent } from 'react-leaflet'
import styled from 'styled-components'
import axios from 'redaxios'
import XMLViewer from 'react-xml-viewer'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import { MdClose } from 'react-icons/md'

import { VectorLayer as VectorLayerType } from '../../../dexieClient'

const StyledXMLViewer = styled(XMLViewer)`
  font-size: small;
`
const StyledDialogContent = styled(DialogContent)`
  padding-top: 0;
`

const customTheme = {
  attributeKeyColor: '#0074D9',
  attributeValueColor: '#2ECC40',
}

type Props = {
  layer: VectorLayerType
}
const VectorLayerComponent = ({ layer }: Props) => {
  const [error, setError] = useState()
  const [data, setData] = useState()

  const map = useMapEvent('zoomend', () => {
    // console.log('VectorLayerComponent zoomend, zoom:', map.getZoom())
    setZoom(map.getZoom())
  })
  const [zoom, setZoom] = useState(map.getZoom())

  useEffect(() => {
    const run = async () => {
      let res
      try {
        res = await axios({
          method: 'get',
          url: layer.url,
          params: {
            service: 'WFS',
            version: layer.wfs_version,
            request: 'GetFeature',
            typeName: layer.type_name,
            srsName: 'EPSG:4326',
            outputFormat: layer.output_format,
            // cql_filter: filterCQL,
            // filter,
            // bbox,
          },
        })
      } catch (error) {
        setError(error.data)
        return false
      }
      setData(res.data)
    }
    run()
  }, [layer])

  // include only if zoom between min_zoom and max_zoom
  if (layer.min_zoom !== undefined && zoom < layer.min_zoom) return null
  if (layer.max_zoom !== undefined && zoom > layer.max_zoom) return null

  return (
    <>
      <GeoJSON key={data ? 1 : 0} data={data} opacity={layer.opacity} />
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

export default VectorLayerComponent