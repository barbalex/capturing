import { useEffect, useContext } from 'react'
import { useMap } from 'react-leaflet'

import { TileLayer as TileLayerType } from '../../../../dexieClient'
import storeContext from '../../../../storeContext'

type Props = {
  layer: TileLayerType
}

const WMTSOffline = ({ layer }: Props) => {
  const map = useMap()
  const store = useContext(storeContext)
  const { setLocalMapValues } = store

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
      try {
        control.saveMap({ layer, store })
      } catch (error) {
        store.addNotification({
          title: `Fehler beim Laden der Karten für ${layer.label}`,
          message: error.message,
        })
      }
    }
    const del = () => control.deleteTable(layer.id)

    setLocalMapValues({ id: layer.id, save, del })

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
    setLocalMapValues,
    store,
  ])

  return null
}

export default WMTSOffline
