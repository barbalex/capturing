import { useEffect, useContext } from 'react'
import { useMap } from 'react-leaflet'

import storeContext from '../../storeContext'

const MapFetcher = () => {
  const { setMap } = useContext(storeContext)
  const map = useMap()

  useEffect(() => {
    setMap(map)
  }, [map])

  return null
}

export default MapFetcher
