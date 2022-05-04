import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import { dexie, ProjectTileLayer as TileLayerType } from '../../../dexieClient'
import TileLayer from './TileLayer'
import OsmColor from '../layers/OsmColor'

const TileLayers = () => {
  const { projectId } = useParams()
  const where = projectId
    ? // Beware: projectId can be undefined and dexie does not like that
      { deleted: 0, active: 1, project_id: projectId }
    : { deleted: 0, active: 1 }

  const tileLayers: TileLayerType[] =
    useLiveQuery(
      async () =>
        await dexie.project_tile_layers.where(where).reverse().sortBy('sort'),
      [projectId],
    ) ?? []
  /**
   * Ensure needed data exists:
   * - url_template has template
   * - wms has base-url and layers
   */
  const validTileLayers = tileLayers.filter((l) => {
    if (!l.type) return false
    if (l.type === 'url_template') {
      if (!l.url_template) return false
    } else {
      if (!l.wms_base_url) return false
      if (!l.wms_layers) return false
    }
    return true
  })

  // is no tile layer was yet defined, use osm
  if (!validTileLayers.length) return [<OsmColor key="osm" />]

  console.log(
    'Map, TileLayers, validTileLayers:',
    validTileLayers.map((t) => t.label),
  )

  return validTileLayers.map((layer) => (
    // use greyscale in key to redraw when user toggles it
    <TileLayer key={JSON.stringify(layer)} layer={layer} />
  ))
}

export default TileLayers
