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
// import { useParams } from 'react-router-dom'

import {
  dexie,
  LayerStyle,
  VectorLayer as VectorLayerType,
  PVLGeom,
} from '../../../dexieClient'
import layerstyleToProperties from '../../../utils/layerstyleToProperties'

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

const bboxBuffer = 0.001

type Props = {
  layer: VectorLayerType
}
const VectorLayerComponent = ({ layer }: Props) => {
  const [error, setError] = useState()
  const [data, setData] = useState()

  const map = useMapEvent('zoomend', () => setZoom(map.getZoom()))
  useMapEvent('moveend', () => setBounds(map.getBounds()))
  const [zoom, setZoom] = useState(map.getZoom())
  const [bounds, setBounds] = useState(map.getBounds())

  console.log('bounds:', bounds)

  /**
   * TODO:
   * if offline/exists?, load from pvl_geoms
   */
  useEffect(() => {
    const run = async () => {
      // TODO: filter only in bbox
      const pvlGeoms: PVLGeom[] = await dexie.pvl_geoms
        .where({
          deleted: 0,
          pvl_id: layer.id,
        })
        // .toArray()
        .filter((g) => {
          return (
            bounds._southWest.lng < g.bbox_sw_lng + bboxBuffer &&
            bounds._southWest.lat < g.bbox_sw_lat + bboxBuffer &&
            bounds._northEast.lng + bboxBuffer > g.bbox_ne_lng &&
            bounds._northEast.lat + bboxBuffer > g.bbox_ne_lat
          )
        })
        .toArray()
      console.log(
        `Fetching data for '${layer.label}' from pvl_geom. pvlGeomsCount:`,
        pvlGeoms.length,
      )
      if (pvlGeoms.length) {
        console.log(`Fetching data for '${layer.label}' from pvl_geom`)
        const data = pvlGeoms.map((pvlGeom) => pvlGeom.geometry)
        setData(data)
        return
      }

      console.log(`Fetching data for '${layer.label}' from wfs`)
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
  }, [
    bounds._northEast.lat,
    bounds._northEast.lng,
    bounds._southWest.lat,
    bounds._southWest.lng,
    layer,
  ])

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
        style={layerStyle ? layerstyleToProperties({ layerStyle }) : {}}
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

export default VectorLayerComponent
