import axios from 'redaxios'
import countBy from 'lodash/countBy'
import sumBy from 'lodash/sumBy'

import { dexie, PVLGeom, ProjectVectorLayer } from '../dexieClient'
import xmlToJson from './xmlToJson'
import featureFromWfsGml from './featureFromWfsGml'

type Props = {
  pvl: ProjectVectorLayer
}

// TODO: do this in worker
const downloadWfs = async ({ pvl, store }: Props) => {
  const { addNotification, removeNotificationById } = store
  if (
    !(
      pvl.type === 'wfs' &&
      pvl.type_name &&
      pvl.wfs_version &&
      pvl.output_format
    )
  ) {
    // console.log('downloadWfs', {
    //   type: pvl.type,
    //   type_name: pvl.type_name,
    //   wfs_version: pvl.wfs_version,
    //   output_format: pvl.output_format,
    // })
    addNotification({
      title: `Geometrien für '${pvl.label}' können nicht geladen werden`,
      message: `Es fehlen benötigte Angaben. Bitte konfigurieren Sie den WFS`,
      type: 'warning',
    })
    return
  }
  // 1. empty this pvl's geoms
  await dexie.pvl_geoms.where({ deleted: 0, pvl_id: pvl.id }).delete()
  // 2. fetch features
  const loadingNotifId = addNotification({
    message: `Lade Geometrien für '${pvl.label}'...`,
    type: 'info',
    duration: 1000000,
  })
  let res
  try {
    res = await axios({
      method: 'get',
      url: pvl.url,
      params: {
        service: 'WFS',
        version: pvl.wfs_version,
        request: 'GetFeature',
        typeName: pvl.type_name,
        srsName: 'EPSG:4326',
        outputFormat: pvl.output_format,
      },
    })
  } catch (error) {
    removeNotificationById(loadingNotifId)
    addNotification({
      title: `Fehler beim Laden der Geometrien für '${pvl.label}'`,
      message: error.message,
      duration: 20000,
    })
    return false
  }
  let features
  const isXml = pvl.output_format.toLowerCase().includes('gml')
  if (isXml) {
    const parser = new window.DOMParser()
    const parsedXml = xmlToJson(parser.parseFromString(res.data, 'text/html'))
    const xmlFeatures =
      parsedXml?.HTML?.BODY?.['WFS:FEATURECOLLECTION']?.['WFS:MEMBER']
    features = xmlFeatures.map((xmlFeature) =>
      featureFromWfsGml({ xmlFeature, typeName: pvl.type_name }),
    )
  } else {
    features = res.data?.features ?? []
  }
  // console.log('downloadWfs, features:', features)
  // 3. build PVLGeoms
  const pvlGeoms = features.map(
    (feature) =>
      new PVLGeom(undefined, pvl.id, feature.geometry, feature.properties),
  )
  // 4. add to dexie
  await dexie.pvl_geoms.bulkPut(pvlGeoms)

  // 5. add statistics to pvl
  const geometries = features.map((f) => f.geometry)
  const geomTypes = countBy(geometries, 'type')
  //  Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon
  const typeCounts = {
    feature_count: geometries.length,
    point_count: sumBy(Object.entries(geomTypes), ([key, value]) =>
      key.toLowerCase().includes('point') ? value : 0,
    ),
    line_count: sumBy(Object.entries(geomTypes), ([key, value]) =>
      key.toLowerCase().includes('line') ? value : 0,
    ),
    polygon_count: sumBy(Object.entries(geomTypes), ([key, value]) =>
      key.toLowerCase().includes('polygon') ? value : 0,
    ),
  }
  // console.log('downloadWfs, typeCounts:', typeCounts)
  await dexie.project_vector_layers.update(pvl.id, typeCounts)

  // 6. clean up
  removeNotificationById(loadingNotifId)
  return true
}

export default downloadWfs
