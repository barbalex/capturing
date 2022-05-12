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
import { useLiveQuery } from 'dexie-react-hooks'
import * as ReactDOMServer from 'react-dom/server'

import {
  dexie,
  LayerStyle,
  VectorLayer as VectorLayerType,
} from '../../../dexieClient'
import layerstyleToProperties from '../../../utils/layerstyleToProperties'
import Popup from '../Popup'

const StyledXMLViewer = styled(XMLViewer)`
  font-size: small;
`
const StyledDialogContent = styled(DialogContent)`
  padding-top: 0;
`

const xmlTheme = {
  attributeKeyColor: '#0074D9',
  attributeValueColor: '#2ECC40',
}

type Props = {
  layer: VectorLayerType
}
const VectorLayerComponent = ({ layer }: Props) => {
  const [error, setError] = useState()

  const map = useMapEvent('zoomend', () => setZoom(map.getZoom()))
  const [zoom, setZoom] = useState(map.getZoom())

  const [data, setData] = useState()
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
          },
        })
      } catch (error) {
        setError(error.data)
        return false
      }
      setData(res.data)
    }
    run()
  }, [layer.output_format, layer.type_name, layer.url, layer.wfs_version])

  const layerStyle: LayerStyle = useLiveQuery(
    async () =>
      await dexie.layer_styles.get({
        project_vector_layer_id: layer.id,
      }),
  )

  // include only if zoom between min_zoom and max_zoom
  if (layer.min_zoom !== undefined && zoom < layer.min_zoom) return null
  if (layer.max_zoom !== undefined && zoom > layer.max_zoom) return null

  return (
    <>
      <GeoJSON
        key={data ? 1 : 0}
        data={data}
        opacity={layer.opacity}
        style={layerstyleToProperties({ layerStyle })}
        onEachFeature={(feature, _layer) => {
          const popupContent = ReactDOMServer.renderToString(
            <Popup feature={feature} label={layer.label} />,
          )
          _layer.bindPopup(popupContent)
        }}
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
          <StyledXMLViewer xml={error} theme={xmlTheme} />
        </StyledDialogContent>
      </Dialog>
    </>
  )
}

export default VectorLayerComponent
