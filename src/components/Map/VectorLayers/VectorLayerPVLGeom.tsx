import { useEffect, useState } from 'react'
import { GeoJSON, useMapEvent } from 'react-leaflet'
import { useLiveQuery } from 'dexie-react-hooks'

import {
  dexie,
  LayerStyle,
  VectorLayer as VectorLayerType,
  PVLGeom,
} from '../../../dexieClient'
import layerstyleToProperties from '../../../utils/layerstyleToProperties'

const bboxBuffer = 0.001

type Props = {
  layer: VectorLayerType
}
const VectorLayerComponent = ({ layer }: Props) => {
  const [data, setData] = useState()

  const map = useMapEvent('zoomend', () => setZoom(map.getZoom()))
  useMapEvent('moveend', () => setBounds(map.getBounds()))
  const [zoom, setZoom] = useState(map.getZoom())
  const [bounds, setBounds] = useState(map.getBounds())

  // console.log('bounds:', bounds)

  useEffect(() => {
    const run = async () => {
      const pvlGeoms: PVLGeom[] = await dexie.pvl_geoms
        .where({
          deleted: 0,
          pvl_id: layer.id,
        })
        .filter((g) => {
          return (
            bounds._southWest.lng < g.bbox_sw_lng + bboxBuffer &&
            bounds._southWest.lat < g.bbox_sw_lat + bboxBuffer &&
            bounds._northEast.lng + bboxBuffer > g.bbox_ne_lng &&
            bounds._northEast.lat + bboxBuffer > g.bbox_ne_lat
          )
        })
        .toArray()

      // console.log(`Fetching data for '${layer.label}' from pvl_geom`)
      const data = pvlGeoms.map((pvlGeom) => pvlGeom.geometry)
      setData(data)
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
    <GeoJSON
      key={data ? 1 : 0}
      data={data}
      opacity={layer.opacity}
      style={layerStyle ? layerstyleToProperties({ layerStyle }) : {}}
    />
  )
}

export default VectorLayerComponent
