import { TileLayer } from 'react-leaflet'

import { TileLayer as TileLayerType } from '../../../dexieClient'

type Props = {
  layer: TileLayerType
}
const TileLayerComponent = ({ layer }: Props) => {
  // TODO: decide whether to use TileLayer or WMSTileLayer
  return (
    <TileLayer
      url={layer.url_template}
      maxNativeZoom={19}
      minZoom={layer.min_zoom}
      maxZoom={layer.max_zoom}
    />
  )
}

export default TileLayerComponent
