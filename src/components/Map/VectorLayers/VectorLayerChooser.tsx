import { useEffect, useState } from 'react'
import { dexie } from '../../../dexieClient'
import VectorLayerWFS from './VectorLayerWFS'
import VectorLayerPVLGeom from './VectorLayerPVLGeom'

/**
 * This component chooses whether to render
 * from WFS or PVLGeom
 */

const VectorLayerChooser = ({ layer }) => {
  const [pvlGeomCount, setPvlGeomCount] = useState()
  useEffect(() => {
    dexie.pvl_geoms
      .where({
        deleted: 0,
        pvl_id: layer.id,
      })
      .count()
      .then((count) => setPvlGeomCount(count))
  }, [layer.id])

  if (pvlGeomCount === undefined) return null
  if (pvlGeomCount === 0) return <VectorLayerWFS layer={layer} />
  return <VectorLayerPVLGeom layer={layer} />
}

export default VectorLayerChooser
