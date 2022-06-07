import { dexie } from '../../dexieClient'
import getCapabilitiesDataForTileLayer from '../../components/TileLayer/Form/getCapabilitiesData'
import getCapabilitiesDataForVectorLayer from '../../components/VectorLayer/Form/getCapabilitiesData'

const addCapabilitiesToIncoming = async ({ object, tableName }) => {
  const existing = await dexie[tableName].get(object.id)
  if (!existing) return object
  let capabilities = {}

  // 1. use existing values (if they exist)
  const existingLocalFields = Object.keys(existing).filter((key) =>
    key.startsWith('_'),
  )
  const incoming = {
    ...object,
  }
  existingLocalFields.forEach((f) => (incoming[f] = existing?.[f]))

  // 2. get capabilities if needed
  if (
    tableName === 'tile_layers' &&
    // if url exists
    existing?.wms_base_url &&
    // ...but no layerOptions
    !existing?._layerOptions?.length
  ) {
    // get capabilities
    capabilities = await getCapabilitiesDataForTileLayer({
      row: object,
      returnValue: true,
    })
  }
  if (
    tableName === 'vector_layers' &&
    // if url exists
    existing?.url &&
    // ...but no layerOptions
    !existing?._layerOptions?.length
  ) {
    // get capabilities
    capabilities = await getCapabilitiesDataForVectorLayer({
      row: object,
      returnValue: true,
    })
  }
  return { ...incoming, ...capabilities }
}

export default addCapabilitiesToIncoming
