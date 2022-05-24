import fetchCapabilities from '../../../utils/getCapabilities'

const getCapabilities = async ({ wms_base_url }) => {
  if (!wms_base_url) return undefined

  const cbData = {}

  const capabilities = await fetchCapabilities({
    url: wms_base_url,
    service: 'WMS',
  })

  cbData.capabilities = capabilities

  cbData.wmsFormatValues =
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
  cbData.infoFormatValues = infoFormats.map((l) => ({
    label: l,
    value: l,
  }))
  // console.log('ProjectTileLayerForm, cbData:', cbData)
  return cbData
}

export default getCapabilities
