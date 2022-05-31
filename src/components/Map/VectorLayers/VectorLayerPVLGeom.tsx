import { useEffect, useState, useContext, useRef, useCallback } from 'react'
import { GeoJSON, useMapEvent, useMap } from 'react-leaflet'
import * as ReactDOMServer from 'react-dom/server'
import { useDebouncedCallback } from 'use-debounce'

import {
  dexie,
  LayerStyle,
  ProjectVectorLayer,
  PVLGeom,
} from '../../../dexieClient'
import layerstyleToProperties from '../../../utils/layerstyleToProperties'
import Popup from '../Popup'
import storeContext from '../../../storeContext'
import MapErrorBoundary from '../../../components/shared/MapErrorBoundary'

// const bboxBuffer = 0.01

type Props = {
  layer: ProjectVectorLayer
}
const VectorLayerComponent = ({ layer }: Props) => {
  const [data, setData] = useState()

  const store = useContext(storeContext)
  const { addNotification, removeNotificationById, showMap } = store

  const removeNotifs = useCallback(() => {
    // console.log('removing notifs')
    loadingNotifIds.current.forEach((id) => removeNotificationById(id))
    loadingNotifIds.current = []
  }, [removeNotificationById])

  const map = useMap()

  const [zoom, setZoom] = useState<number>(map.getZoom())
  const [layerStyle, setLayerStyle] = useState<LayerStyle>()

  useMapEvent('dragend zoomend ', () => {
    // console.log('dragend zoomend ')
    fetchDataDebounced({ bounds: map.getBounds() })
  })

  const fetchData = useCallback(
    async ({ bounds }) => {
      if (!showMap) return
      // console.log('VectorLayerPVLGeom fetching data')
      removeNotifs()
      const loadingNotifId = addNotification({
        message: `Lade Vektor-Karte ${layer.label}...`,
        type: 'info',
        duration: 100000,
      })
      loadingNotifIds.current = [loadingNotifId, ...loadingNotifIds.current]
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
      removeNotifs()
      setData(data)
      const _layerStyle: LayerStyle = await dexie.layer_styles.get({
        project_vector_layer_id: layer.id,
      })
      setLayerStyle(_layerStyle)
      setZoom(map.getZoom())
    },
    [
      addNotification,
      layer.id,
      layer.label,
      layer.max_features,
      map,
      removeNotifs,
      showMap,
    ],
  )
  const fetchDataDebounced = useDebouncedCallback(fetchData, 600)

  useEffect(() => {
    fetchDataDebounced({ bounds: map.getBounds() })
  }, [fetchDataDebounced, map, showMap])
  const loadingNotifIds = useRef([])

  useEffect(() => {
    // goal: remove own notifs when (de-)activating layer
    removeNotifs()
  }, [layer.active, removeNotifs])
  useEffect(() => {
    return () => {
      // goal: remove notifs on leaving component. Does not seem to work
      removeNotifs()
    }
  }, [removeNotifs])

  // include only if zoom between min_zoom and max_zoom
  if (layer.min_zoom !== undefined && zoom < layer.min_zoom) return null
  if (layer.max_zoom !== undefined && zoom > layer.max_zoom) return null

  removeNotifs()
  if (
    data?.length === layer.max_features ??
    (1000 && !loadingNotifIds.current.length)
  ) {
    const loadingNotifId = addNotification({
      title: `Zuviele Geometrien`,
      message: `Die maximale Anzahl Features von ${
        layer.max_features ?? 1000
      } für Vektor-Karte ${layer.label} wurde geladen. Zoomen sie näher ran`,
      type: 'warning',
    })
    loadingNotifIds.current = [loadingNotifId, ...loadingNotifIds.current]
  }

  if (!data?.length) return null

  const mapSize = map.getSize()

  return (
    <MapErrorBoundary layer={layer}>
      <GeoJSON
        key={data?.length ?? 0}
        data={data}
        opacity={layer.opacity}
        style={layerstyleToProperties({ layerStyle })}
        onEachFeature={(feature, _layer) => {
          const layersData = [
            {
              label: layer.label,
              properties: Object.entries(feature?.properties ?? {}),
            },
          ]
          const popupContent = ReactDOMServer.renderToString(
            <Popup layersData={layersData} mapSize={mapSize} />,
          )
          _layer.bindPopup(popupContent)
        }}
      />
    </MapErrorBoundary>
  )
}

export default VectorLayerComponent
