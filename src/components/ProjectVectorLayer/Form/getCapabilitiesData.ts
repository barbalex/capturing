import getCapabilities from '../../../utils/getCapabilities'
import { dexie } from '../../../dexieClient'

const getCapabilitiesDataForVectorLayer = async ({ row }) => {
  // console.log('getCapabilitiesDataForVectorLayer, row:', row)
  if (!row) return
  const values = {}

  const response = await getCapabilities({
    url: row?.url,
    service: 'WFS',
  })

  const capabilities = response?.HTML?.BODY?.['WFS:WFS_CAPABILITIES']

  // console.log('getCapabilitiesDataForVectorLayer, capabilities:', capabilities)

  // 1. wfs version
  if (!row.wfs_version) {
    values.wfs_version = capabilities?.['@attributes']?.version
  }

  // 2. output formats
  const _operations =
    capabilities?.['OWS:OPERATIONSMETADATA']?.['OWS:OPERATION'] ?? []
  const getFeatureOperation = _operations.find(
    (o) => o?.['@attributes']?.name === 'GetFeature',
  )
  const _outputFormats = (
    getFeatureOperation?.['OWS:PARAMETER']?.['OWS:ALLOWEDVALUES']?.[
      'OWS:VALUE'
    ] ?? []
  ).map((v) => v?.['#text'])
  // TODO:
  // also accept gml
  // example: https://maps.zh.ch/wfs/VeloparkieranlagenZHWFS
  // enable dealing with it...
  // OR: do not allow to choose layers that do not allow json
  const acceptableOutputFormats = _outputFormats.filter(
    (v) =>
      v?.toLowerCase?.()?.includes('json') ||
      v?.toLowerCase?.()?.includes('gml'),
  )
  const preferredOutputFormat =
    acceptableOutputFormats.filter((v) =>
      v.toLowerCase().includes('geojson'),
    )[0] ??
    acceptableOutputFormats.filter((v) =>
      v.toLowerCase().includes('application/json'),
    )[0] ??
    acceptableOutputFormats[0]
  if (!row._outputFormatOptions) {
    values._outputFormatOptions = acceptableOutputFormats.map((v) => ({
      label: v,
      value: v,
    }))
  }
  if (!row.output_format) {
    values.output_format = preferredOutputFormat
  }

  // 3. label
  const _label =
    capabilities?.['OWS:SERVICEIDENTIFICATION']?.['OWS:TITLE']?.['#text']
  if (!row.label) {
    values.label = _label
  }

  // 4. layers
  let layers = capabilities?.FEATURETYPELIST?.FEATURETYPE ?? []
  // this value can be array OR object!!!
  if (!Array.isArray(layers)) layers = [layers]
  if (!row._layerOptions) {
    values._layerOptions = layers
      .filter(
        (l) =>
          l.OTHERCRS?.map((o) => o?.['#text']?.includes('EPSG:4326')) ||
          l.DefaultCRS?.map((o) => o?.['#text']?.includes('EPSG:4326')),
      )
      .filter((l) =>
        preferredOutputFormat
          ? l.OUTPUTFORMATS?.FORMAT?.map((f) => f?.['#text'])?.includes(
              preferredOutputFormat,
            )
          : true,
      )
      .map((v) => ({
        label: v.TITLE?.['#text'] ?? v.NAME?.['#text'],
        value: v.NAME?.['#text'],
      }))
  }

  await dexie.project_vector_layers.update(row.id, values)

  // console.log('pvl, getCapabilitiesData, values:', values)

  return
}

export default getCapabilitiesDataForVectorLayer
