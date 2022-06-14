import { useContext } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'

import storeContext from '../../storeContext'

const MapZoomFetcher = () => {
  const { setMapZoom, mapZoom } = useContext(storeContext)
  const map = useMap()

  useMapEvents({
    zoomend() {
      const zoom = map.getZoom()
      if (zoom !== mapZoom) setMapZoom(zoom)
    },
  })

  return null
}

export default MapZoomFetcher
