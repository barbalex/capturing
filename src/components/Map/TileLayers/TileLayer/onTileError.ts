// TODO: need to debounce
import axios from 'redaxios'

import { ProjectTileLayer } from '../../../../dexieClient'

type Props = {
  layer: ProjectTileLayer
  store: any
  map: any
}

const onTileError = async (map, layer, store) => {
  console.log('onTileError', { store, layer, map })
  const mapSize = map.getSize()
  const bbox = map.getBounds().toBBoxString()
  const res = await axios({
    method: 'get',
    url: layer.wms_base_url,
    params: {
      service: 'WMS',
      request: 'GetMap',
      version: layer.wms_version,
      layers: layer.wms_layers,
      format: layer.wms_format,
      crs: 'EPSG:4326',
      width: mapSize.x,
      height: mapSize.y,
      bbox,
    },
  })
  console.log(`onTileError res.data:`, res.data)
  const isXML = res.data.includes('<ServiceException>')
  console.log(`onTileError isXML:`, isXML)
}

export default onTileError
