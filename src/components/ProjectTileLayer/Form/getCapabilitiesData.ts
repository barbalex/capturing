import axios from 'redaxios'

import fetchCapabilities from '../../../utils/getCapabilities'
import { dexie, ProjectTileLayer } from '../../../dexieClient'
import getValuesToSetFromCapabilities from './getValuesToSetFromCapabilities' 

type Props = {
  row: ProjectTileLayer
}

const getCapabilitiesData = async ({ row }: Props) => {
  if (!row?.wms_base_url) return undefined

  console.log('getCapabilitiesData for row:', row.label)

  const cbData = {}

  const capabilities = await fetchCapabilities({
    url: row.wms_base_url,
    service: 'WMS',
  })

  cbData._wmsFormatOptions =
    capabilities?.Capability?.Request?.GetMap?.Format.filter((v) =>
      v.toLowerCase().includes('image'),
    ).map((v) => ({
      label: v,
      value: v,
    }))

  // let user choose from layers
  // only layers with crs EPSG:4326
  const layers = (capabilities?.Capability?.Layer?.Layer ?? []).filter((v) =>
    v?.CRS?.includes('EPSG:4326'),
  )
  cbData._layerOptions = layers.map((v) => ({
    label: v.Title,
    value: v.Name,
  }))

  // fetch legends
  cbData._legendUrls = layers
    .map((l) => ({
      title: l.Title,
      url: l.Style?.[0]?.LegendURL?.[0]?.OnlineResource,
      name: l.Name,
    }))
    .filter((u) => !!u.url)

  const legendUrlsToUse = cbData._legendUrls.filter((lUrl) =>
    row.wms_layers?.includes?.(lUrl.name),
  )

  const _legendBlobs = []
  for (const lUrl of legendUrlsToUse) {
    let res
    try {
      res = await axios.get(lUrl.url, {
        responseType: 'blob',
      })
    } catch (error) {
      // error can also be caused by timeout
      console.log(`error fetching legend for layer '${lUrl.title}':`, error)
      return false
    }
    // console.log('Legends, res.data:', res.data)
    if (res.data) _legendBlobs.push([lUrl.title, res.data])
  }

  // add legends into row to reduce network activity and make them offline available
  cbData._wmsLegends = _legendBlobs.length ? _legendBlobs : undefined

  // use capabilities.Capability?.Request?.GetFeatureInfo?.Format
  // to set wms_info_format
  const infoFormats =
    capabilities?.Capability?.Request?.GetFeatureInfo?.Format ?? []
  cbData._infoFormatOptions = infoFormats.map((l) => ({
    label: l,
    value: l,
  }))
  // console.log('ProjectTileLayerForm, cbData:', cbData)
  const uptoDateRow = await dexie.project_tile_layers.get(row.id)
  const valuesToSet = getValuesToSetFromCapabilities({
    capabilities,
    wms_format: row?.wms_format,
    wms_version: row?.wms_version,
    label: row?.label,
    wms_layers: row?.wms_layers,
    wms_queryable: row?.wms_queryable,
    wms_info_format: row?.wms_info_format,
  })
  const newValue = { ...uptoDateRow, ...cbData, ...valuesToSet }
  await dexie.project_tile_layers.put(newValue)
  return
}

export default getCapabilitiesData
