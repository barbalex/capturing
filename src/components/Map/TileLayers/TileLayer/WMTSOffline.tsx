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

  console.log('WMTSOffline, Dexie:', window.Dexie)

  useEffect(() => {
    const wmtsLayer = L.tileLayer(layer.wmts_url_template, {
      maxNativeZoom: 19,
      minZoom: layer.min_zoom,
      maxZoom: layer.max_zoom,
      greyscale: layer.greyscale,
      className: layer.greyscale ? 'grayscale' : '',
      opacity: layer.opacity,
    })
    wmtsLayer.addTo(map)
    const control = L.control.savetiles(wmtsLayer, {
      confirmSave: function (status, saveCallback) {
        const newTname = prompt(
          `Please enter map name (${status._tilesforSave.length} tiles):`,
          '',
        )
        if (!newTname) return // user cancelled the prompt
        saveCallback(newTname)
      },
    })
    control.addTo(map)
    control.openDB()

    const savem = () => {
      control.setBounds(map.getBounds())
      control.saveMap()
    }
    const delm = () => {
      control.deleteTable(control.dtable.name)
    }
    wmtsLayer.on('loadend', (e) => {
      // all tiles just saved
      control.putItem('mapSize', e.mapSize)
      control
        .getItem('mapSize')
        .then((msize) =>
          alert(`size of map '${control.dtable.name}' is ${msize} bytes`),
        )
    })

    return () => {
      map.removeLayer(wmtsLayer)
      map.removeControl(control)
    }
  }, [
    layer.greyscale,
    layer.max_zoom,
    layer.min_zoom,
    layer.opacity,
    layer.wmts_url_template,
    map,
  ])

  return null
}

export default WMTSOffline
