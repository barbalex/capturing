import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import {
  dexie,
  VectorLayer as VectorLayerType,
} from '../../../dexieClient'
import VectorLayerChooser from './VectorLayerChooser'

const VectorLayers = () => {
  const { projectId } = useParams()
  const where = projectId
    ? // Beware: projectId can be undefined and dexie does not like that
      { deleted: 0, active: 1, project_id: projectId }
    : { deleted: 0, active: 1 }

  const vectorLayers: VectorLayerType[] =
    useLiveQuery(
      async () =>
        await dexie.vector_layers.where(where).reverse().sortBy('sort'),
      [projectId],
    ) ?? []

  // Ensure needed data exists
  const validVectorLayers = vectorLayers.filter((l) => {
    if (!l.url) return false
    if (!l.type_name) return false
    if (!l.output_format) return false

    return true
  })

  if (!validVectorLayers.length) return []

  return validVectorLayers.map((layer: VectorLayerType) => {
    const partsToRedrawOn = {
      id: layer.id,
      url: layer.url,
      max_zoom: layer.max_zoom,
      min_zoom: layer.min_zoom,
      opacity: layer.opacity,
      type_name: layer.type_name,
      wfs_version: layer.wfs_version,
      output_format: layer.output_format,
    }

    return (
      <VectorLayerChooser key={JSON.stringify(partsToRedrawOn)} layer={layer} />
    )
  })
}

export default VectorLayers
