import { useLiveQuery } from 'dexie-react-hooks'

import { dexie } from '../../../dexieClient'
import VectorLayerWFS from './VectorLayerWFS'
import VectorLayerPVLGeom from './VectorLayerPVLGeom'

/**
 * This component chooses whether to render
 * from WFS or PVLGeom
 */

const VectorLayerChooser = ({ layer }) => {
  const pvlGeomCount: integer = useLiveQuery(
    async () =>
      await dexie.pvl_geoms
        .where({
          deleted: 0,
          pvl_id: layer.id,
        })
        .count(),
    [layer.id],
  )

  // TODO: only accept pre-downloaded layers because of
  // problems filtering by bbox?
  if (pvlGeomCount === undefined) return null
  if (pvlGeomCount === 0) return <VectorLayerWFS layer={layer} />
  return <VectorLayerPVLGeom layer={layer} />
}

export default VectorLayerChooser
