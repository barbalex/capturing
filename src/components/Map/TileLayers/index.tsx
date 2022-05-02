import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import { dexie, TileLayer as TileLayerType } from '../../../dexieClient'
import TileLayer from './TileLayer'
import OsmColor from '../layers/OsmColor'

const TileLayers = () => {
  const { projectId } = useParams()
  const where = projectId
    ? // Beware: projectId can be undefined and dexie does not like that
      { deleted: 0, active: 0, project_id: projectId }
    : { deleted: 0, active: 0 }

  const tileLayers: TileLayerType[] = useLiveQuery(
    async () => await dexie.tile_layers.where(where).toArray(),
    [projectId],
  )

  // console.log('TableLayers rendering')
  if (!projectId) return [<OsmColor key="osm" />]

  if (!tileLayers) return []

  console.log('TableLayers tileLayers:', tileLayers)
  return tileLayers.map((layer) => <TileLayer key={layer.id} layer={layer} />)
}

export default TileLayers
