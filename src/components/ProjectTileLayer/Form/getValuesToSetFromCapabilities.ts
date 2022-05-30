const getValuesToSetFromCapabilities = async ({
  capabilities,
  wms_format,
  wms_version,
  label,
  wms_layers,
  wms_queryable,
  wms_info_format,
}) => {
  const valuesToSet = {}
  // setWmsFormatValues(imageFormatValues)
  // if wms_format is not yet set, set version with png or jpg
  if (!wms_format) {
    const _wmsFormatValues =
      capabilities?.Capability?.Request?.GetMap?.Format.filter((v) =>
        v.toLowerCase().includes('image'),
      )
    const preferedFormat =
      _wmsFormatValues.find((v) => v?.toLowerCase?.().includes('image/png')) ??
      _wmsFormatValues.find((v) => v?.toLowerCase?.().includes('png')) ??
      _wmsFormatValues.find((v) => v?.toLowerCase?.().includes('image/jpeg')) ??
      _wmsFormatValues.find((v) => v?.toLowerCase?.().includes('jpeg'))
    if (preferedFormat) {
      valuesToSet.wms_format = preferedFormat
    }
  }

  const _wmsVersion = capabilities?.version
  if (_wmsVersion) {
    if (!wms_version) {
      valuesToSet.wms_version = _wmsVersion
    }
  }
  // set title as label if undefined
  if (!label && capabilities?.Service?.Title) {
    valuesToSet.label = capabilities?.Service?.Title
  }
  const layers = capabilities?.Capability?.Layer?.Layer ?? []
  const _layerOptions = layers
    ?.filter((v) => v?.CRS?.includes('EPSG:4326'))
    .map((v) => v.Name)
  // activate all layers, if only one
  if (!wms_layers && _layerOptions?.map && _layerOptions?.length === 1) {
    valuesToSet.wms_layers = _layerOptions.map((o) => o.value).join(',')
  }

  // use capabilities.Capability?.Layer?.Layer[this]?.queryable to allow/disallow getting feature info?
  if (![0, 1].includes(wms_queryable)) {
    valuesToSet.wms_queryable = layers.some((l) => l.queryable) ? 1 : 0
  }

  // use capabilities.Capability?.Request?.GetFeatureInfo?.Format to set wms_info_format
  const infoFormats =
    capabilities?.Capability?.Request?.GetFeatureInfo?.Format ?? []
  // set info_format if undefined
  if (!wms_info_format && infoFormats.length) {
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
      valuesToSet.wms_info_format = preferedFormat
    }
  }

  return valuesToSet
}

export default getValuesToSetFromCapabilities
