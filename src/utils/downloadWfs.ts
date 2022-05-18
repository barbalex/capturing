import axios from 'redaxios'
import { dexie, PVLGeom, ProjectVectorLayer } from '../dexieClient'

type Props = {
  pvl: ProjectVectorLayer
}

const downloadWfs = async ({ pvl, store }: Props) => {
  if (
    !(
      pvl.type === 'wfs' &&
      pvl.type_name &&
      pvl.wfs_version &&
      pvl.output_format
    )
  ) {
    // TODO: tell user data is not ready?

    store.addNotification({
      message: `Die Voraussetzungen, um Geometrien für ${pvl.label} zu laden, sind nicht erfüllt`,
      type: 'warning',
    })
    return
  }
  // 1. empty this pvl's geoms
  await dexie.pvl_geoms.where({ deleted: 0, pvl_id: pvl.id }).delete()
  // 2. fetch features
  const loadingNotifId = store.addNotification({
    message: `Lade Geometrien für ${pvl.label}...`,
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
    store.removeNotificationById(loadingNotifId)
    console.log('DownloadPVL, error:', {
      url: error?.url,
      error,
      status: error?.status,
      statusText: error?.statusText,
      data: error?.data,
      type: error?.type,
    })
    // console.log(`error fetching ${row.label}`, error?.toJSON())
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data)
      console.log(error.response.status)
      console.log(error.response.headers)
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      // TODO: surface
      console.log('Error', error.message)
    }
    // console.log(error.config)

    store.addNotification({
      message: `Fehler beim Laden der Geometrien für ${pvl.label}: Status ${error?.status}, ${error?.statusText}, Daten: ${error?.data}, Typ: ${error?.type}`,
    })
    return false
  }
  store.removeNotificationById(loadingNotifId)
  const features = res.data?.features
  // 3. build PVLGeoms
  const pvlGeoms = features.map(
    (feature) =>
      new PVLGeom(undefined, pvl.id, feature.geometry, feature.properties),
  )
  // 4. add to dexie
  await dexie.pvl_geoms.bulkPut(pvlGeoms)
  return true
}

export default downloadWfs
