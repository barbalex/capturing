import { Rectangle } from 'react-leaflet/Rectangle'

import { TileLayer } from '../../../../dexieClient'
import MapErrorBoundary from '../../../shared/MapErrorBoundary'

type Props = {
  layer: TileLayer
}

const LocalMapComponent = ({ layer }: Props) => {
  const bounds = layer.local_data_bounds.map((b) =>
    L.latLngBounds(b._southWest, b._northEast),
  )

  return (
    <MapErrorBoundary layer={layer}>
      {bounds.map((b, index) => (
        <Rectangle key={index} bounds={b} />
      ))}
    </MapErrorBoundary>
  )
}

export default LocalMapComponent
