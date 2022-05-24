import fetchCapabilities from '../../../utils/getCapabilities'

const getCapabilities = async ({ onBlur, row }) => {
  if (!row?.wms_base_url) return undefined

  const cbData = {}

  const capabilities = await fetchCapabilities({
    url: row?.wms_base_url,
    service: 'WMS',
  })
  // console.log('getCapabilities:', capabilities)
  const _wmsVersion = capabilities?.version
  if (_wmsVersion) {
    if (!row.wms_version) {
      onBlur({
        target: { name: 'wms_version', value: _wmsVersion },
      })
    }
  }
  const imageFormatValues =
    capabilities?.Capability?.Request?.GetMap?.Format.filter((v) =>
      v.toLowerCase().includes('image'),
    ).map((v) => ({
      label: v,
      value: v,
    }))
  cbData.wmsFormatValues = imageFormatValues
  // setWmsFormatValues(imageFormatValues)
  // if wms_format is not yet set, set version with png or jpg
  if (!row.wms_format) {
    const formatValueStrings = imageFormatValues
      ? imageFormatValues.map((v) => v.value)
      : []
    const preferedFormat =
      formatValueStrings.find((v) =>
        v?.toLowerCase?.().includes('image/png'),
      ) ??
      formatValueStrings.find((v) => v?.toLowerCase?.().includes('png')) ??
      formatValueStrings.find((v) =>
        v?.toLowerCase?.().includes('image/jpeg'),
      ) ??
      formatValueStrings.find((v) => v?.toLowerCase?.().includes('jpeg'))
    if (preferedFormat) {
      onBlur({
        target: { name: 'wms_format', value: preferedFormat },
      })
    }
  }
  // set title as label if undefined
  if (!row.label) {
    onBlur({
      target: { name: 'label', value: capabilities?.Service?.Title },
    })
  }
  // let user choose from layers
  // filter only layers with crs EPSG:4326
  const layers = capabilities?.Capability?.Layer?.Layer ?? []
  const _layerOptions = layers
    ?.filter((v) => v?.CRS?.includes('EPSG:4326'))
    .map((v) => ({
      label: v.Title,
      value: v.Name,
    }))
  cbData.layerOptions = _layerOptions
  if (!row.wms_layers && _layerOptions?.map && _layerOptions?.length === 1) {
    // activate all layers, if only one
    onBlur({
      target: {
        name: 'wms_layers',
        value: _layerOptions.map((o) => o.value).join(','),
      },
    })
  }

  // fetch legends
  const lUrls = layers
    .map((l) => ({
      title: l.Title,
      url: l.Style?.[0]?.LegendURL?.[0]?.OnlineResource,
      name: l.Name,
    }))
    .filter((u) => !!u.url)
  cbData.legendUrls = lUrls

  // use capabilities.Capability?.Layer?.Layer[this]?.queryable to allow/disallow getting feature info?
  // console.log('ProjectTileLayerForm, layers:', layers)
  if (![0, 1].includes(row.wms_queryable)) {
    onBlur({
      target: {
        name: 'wms_queryable',
        value: layers.some((l) => l.queryable) ? 1 : 0,
      },
    })
  }

  // use capabilities.Capability?.Request?.GetFeatureInfo?.Format
  // to set wms_info_format
  const infoFormats =
    capabilities?.Capability?.Request?.GetFeatureInfo?.Format ?? []
  cbData.infoFormatValues = infoFormats.map((l) => ({
    label: l,
    value: l,
  }))
  // set info_format if undefined
  if (!row.wms_info_format) {
    // for values see: https://docs.geoserver.org/stable/en/user/services/wms/reference.html#getfeatureinfo
    const preferedFormat =
      infoFormats.find(
        (v) => v?.toLowerCase?.() === 'application/vnd.ogc.gml',
      ) ??
      infoFormats.find((v) =>
        v?.toLowerCase?.().includes('application/vnd.ogc.gml'),
      ) ??
      infoFormats.find((v) => v?.toLowerCase?.().includes('text/plain')) ??
      infoFormats.find((v) =>
        v?.toLowerCase?.().includes('application/json'),
      ) ??
      infoFormats.find((v) => v?.toLowerCase?.().includes('text/javascript')) ??
      infoFormats.find((v) => v?.toLowerCase?.().includes('text/html'))
    if (preferedFormat) {
      onBlur({
        target: {
          name: 'wms_info_format',
          value: preferedFormat,
        },
      })
    }
  }
  // console.log('ProjectTileLayerForm, cbData:', cbData)
  return cbData
}

export default getCapabilities
