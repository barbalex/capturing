import { useEffect, useContext, useRef } from 'react'
import { useMap } from 'react-leaflet'

import { TileLayer as TileLayerType } from '../../../../dexieClient'
import storeContext from '../../../../storeContext'

type Props = {
  layer: TileLayerType
}

const WMTSOffline = ({ layer }: Props) => {
  const map = useMap()
  const store = useContext(storeContext)
  const { setLocalMap, setLocalMapValues } = store

  const boundsRef = useRef()

  useEffect(() => {
    const wmtsLayer = L.tileLayer.offline(layer.wmts_url_template, {
      maxNativeZoom: 19,
      minZoom: layer.min_zoom,
      maxZoom: layer.max_zoom,
      greyscale: layer.greyscale,
      className: layer.greyscale ? 'grayscale' : '',
      opacity: layer.opacity,
    })
    wmtsLayer.addTo(map)
    const control = L.control.savetiles(wmtsLayer, {
      confirmSave: (status, saveCallback) => saveCallback(layer.id),
    })
    control.addTo(map)
    control.openDB()

    const save = () => {
      const bounds = map.getBounds()
      boundsRef.current = bounds
      try {
        control.saveMap({ layer, store })
      } catch (error) {
        store.addNotification({
          title: `Fehler beim Laden der Karten für ${layer.label}`,
          message: error.message,
        })
      }
    }
    const del = () => {
      control.deleteTable(control.dtable.name)
    }
    setLocalMap({ id: layer.id, save, delete: del })
    wmtsLayer.on('loadend', (e) => {
      console.log('loadend', { mapSize: e.mapSize, bounds: boundsRef.current })
      // TODO: if may edit, add bounds to tile_layer.local_data_bounds and update local_data_size
      // all tiles just saved
      control.putItem('mapSize', e.mapSize)
      control.putItem('bounds', boundsRef.current)
      control
        .getItem('mapSize')
        .then((msize) =>
          alert(`size of map '${control.dtable.name}' is ${msize} bytes`),
        )
      setLocalMapValues({
        id: layer.id,
        size: e.mapSize,
      })
    })

    return () => {
      map.removeLayer(wmtsLayer)
      map.removeControl(control)
    }
  }, [
    layer,
    layer.greyscale,
    layer.id,
    layer.label,
    layer.max_zoom,
    layer.min_zoom,
    layer.opacity,
    layer.wmts_url_template,
    map,
    setLocalMap,
    setLocalMapValues,
    store,
  ])

  return null
}

export default WMTSOffline
