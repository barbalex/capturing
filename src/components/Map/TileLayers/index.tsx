import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import { dexie, TileLayer as TileLayerType } from '../../../dexieClient'
import TileLayer from './TileLayer'
import OsmColor from '../layers/OsmColor'

const TileLayers = () => {
  const { projectId } = useParams()
  const where = projectId
    ? // Beware: projectId can be undefined and dexie does not like that
      { deleted: 0, active: 1, project_id: projectId }
    : { deleted: 0, active: 1 }

  const tileLayers: TileLayerType[] = useLiveQuery(
    async () => await dexie.project_tile_layers.where(where).sortBy('sort'),
    [projectId],
  )

  if (!tileLayers) return []
  // is no tile layer was yet defined, use osm
  if (!tileLayers.length) return [<OsmColor key="osm" />]

  return tileLayers.map((layer) => (
    // use greyscale in key to redraw when user toggles it
    <TileLayer key={`${layer.id}/${layer.greyscale}`} layer={layer} />
  ))
}

export default TileLayers
