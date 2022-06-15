import { useContext } from 'react'
import { observer } from 'mobx-react-lite'

import { TileLayer } from '../../../../dexieClient'
import WMS from './WMS'
import WMTS from './WMTSOffline'
import storeContext from '../../../../storeContext'

type Props = {
  layer: TileLayer
}

const TileLayerComponent = ({ layer }: Props) => {
  const { localMapShow } = useContext(storeContext)
  const showLocalMap = localMapShow.get(layer.id)?.show ?? false

  console.log('TileLayerChooser, showLocalMap:', showLocalMap)

  if (layer.type === 'wmts') {
    return (
      <>
        {showLocalMap && <div>localMap</div>}
        <WMTS layer={layer} />
      </>
    )
  } else {
    return <WMS layer={layer} />
  }
}

export default observer(TileLayerComponent)
