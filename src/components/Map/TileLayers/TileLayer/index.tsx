import { TileLayer } from '../../../../dexieClient'
import WMS from './WMS'
import WMTS from './WMTS'

type Props = {
  layer: TileLayer
}
const TileLayerComponent = ({ layer }: Props) => {
  if (layer.type === 'wmts') {
    return <WMTS layer={layer} />
  } else {
    return <WMS layer={layer} />
  }
}

export default TileLayerComponent
