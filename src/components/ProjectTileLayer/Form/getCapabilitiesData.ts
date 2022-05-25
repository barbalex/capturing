import fetchCapabilities from '../../../utils/getCapabilities'
import { dexie } from '../../../dexieClient'
import getValuesToSetFromCapabilities from './getValuesToSetFromCapabilities'

const getCapabilitiesData = async ({ row }) => {
  if (!row?.wms_base_url) return undefined

  const cbData = {}

  const capabilities = await fetchCapabilities({
    url: row.wms_base_url,
    service: 'WMS',
  })

  cbData.wmsFormatOptions =
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
  cbData.layerOptions = layers.map((v) => ({
    label: v.Title,
    value: v.Name,
  }))

  // fetch legends
  cbData.legendUrls = layers
    .map((l) => ({
      title: l.Title,
      url: l.Style?.[0]?.LegendURL?.[0]?.OnlineResource,
      name: l.Name,
    }))
    .filter((u) => !!u.url)

  // use capabilities.Capability?.Request?.GetFeatureInfo?.Format
  // to set wms_info_format
  const infoFormats =
    capabilities?.Capability?.Request?.GetFeatureInfo?.Format ?? []
  cbData.infoFormatOptions = infoFormats.map((l) => ({
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
