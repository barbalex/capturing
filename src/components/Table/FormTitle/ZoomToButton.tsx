import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import getBbox from '@turf/bbox'
import isEqual from 'lodash/isEqual'

import { dexie, Row } from '../../../dexieClient'
import ZoomToButton from '../../shared/ZoomToButton'

const ZoomToButtonComponent = () => {
  const { tableId } = useParams()

  const data = useLiveQuery(async () => {
    const rows: Row[] = await dexie.rows
      .where({ table_id: tableId, deleted: 0 })
      .toArray()
    const fc = {
      type: 'FeatureCollection',
      features: rows
        .filter((r) => !!r.geometry)
        .map((e) => ({
          geometry: e.geometry,
          type: 'Feature',
        })),
    }
    const bbox = getBbox(fc)
    const bboxIsInfinite = isEqual(bbox, [
      Infinity,
      Infinity,
      -Infinity,
      -Infinity,
    ])

    return { bbox, bboxIsInfinite }
  }, [])
  const bbox = data?.bbox
  const bboxIsInfinite = data?.bboxIsInfinite

  return <ZoomToButton bbox={bbox} geometryExists={!bboxIsInfinite} />
}

export default ZoomToButtonComponent
