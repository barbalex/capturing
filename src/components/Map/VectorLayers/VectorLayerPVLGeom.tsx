import { useEffect, useState, useContext, useRef, useCallback } from 'react'
import { GeoJSON, useMapEvent } from 'react-leaflet'
import * as ReactDOMServer from 'react-dom/server'

import {
  dexie,
  LayerStyle,
  ProjectVectorLayer,
  PVLGeom,
} from '../../../dexieClient'
import layerstyleToProperties from '../../../utils/layerstyleToProperties'
import Popup from '../Popup'
import storeContext from '../../../storeContext'

// const bboxBuffer = 0.01

type Props = {
  layer: ProjectVectorLayer
}
const VectorLayerComponent = ({ layer }: Props) => {
  const [data, setData] = useState()

  const store = useContext(storeContext)
  const { addNotification, removeNotificationById } = store

  const removeNotifs = useCallback(() => {
    for (const id in [...loadingNotifIds.current]) {
      removeNotificationById(id)
      loadingNotifIds.current = loadingNotifIds.current.filter((e) => e !== id)
    }
  }, [removeNotificationById])

  const map = useMapEvent('zoomend', () => {
    console.log('zoomend')
    setZoom(map.getZoom())
    removeNotifs()
  })
  useMapEvent('moveend', () => {
    console.log('moveend')
    setBounds(map.getBounds())
  })
  const [zoom, setZoom] = useState<number>(map.getZoom())
  const [layerStyle, setLayerStyle] = useState<LayerStyle>()
  const [bounds, setBounds] = useState(map.getBounds())
  const loadingNotifIds = useRef([])

  console.log('bounds:', bounds)
  // turned filtering by bounds off because did not work well on edges

  useEffect(() => {
    const run = async () => {
      const pvlGeoms: PVLGeom[] = await dexie.pvl_geoms
        .where({
          deleted: 0,
          pvl_id: layer.id,
        })
        .filter((g) => {
          return (
            bounds._southWest.lng < g.bbox_sw_lng &&
            bounds._southWest.lat < g.bbox_sw_lat &&
            bounds._northEast.lng > g.bbox_ne_lng &&
            bounds._northEast.lat > g.bbox_ne_lat
          )
        })
        .limit(layer.max_features ?? 1000)
        .toArray()

      const data = pvlGeoms.map((pvlGeom) => ({
        ...pvlGeom.geometry,
        properties: pvlGeom.properties,
      }))
      console.log(`Fetching data for '${layer.label}' from pvl_geom`, {
        bounds,
        length: data.length,
      })
      setData(data)
      const _layerStyle: LayerStyle = await dexie.layer_styles.get({
        project_vector_layer_id: layer.id,
      })
      setLayerStyle(_layerStyle)
    }
    run()
  }, [
    bounds,
    bounds._northEast.lat,
    bounds._northEast.lng,
    bounds._southWest.lat,
    bounds._southWest.lng,
    layer,
  ])

  // include only if zoom between min_zoom and max_zoom
  if (layer.min_zoom !== undefined && zoom < layer.min_zoom) return null
  if (layer.max_zoom !== undefined && zoom > layer.max_zoom) return null

  if (
    data?.length === layer.max_features ??
    (1000 && !loadingNotifIds.current.length)
  ) {
    const loadingNotifId = addNotification({
      message: `Die maximale Anzahl Features von ${
        layer.max_features ?? 1000
      } für Vektor-Karte ${layer.label} wurde geladen. Zoomen sie näher ran`,
      type: 'warning',
      duration: 1000000,
    })
    loadingNotifIds.current = [loadingNotifId, ...loadingNotifIds.current]
  }

  console.log('VectorLayerPVLGeom, data.length:', data?.length)

  return (
    <GeoJSON
      key={data?.length ?? 0}
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
  )
}

export default VectorLayerComponent
