import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import { dexie, Table, Row, LayerStyle } from '../../../dexieClient'
import TableLayer from './TableLayer'
import layerstyleToProperties from '../../../utils/layerstyleToProperties'

const getStyle = (feature) => ({
  color: feature?.properties?.color,
})

const TableLayers = () => {
  const { projectId, rowId } = useParams()

  const layers = useLiveQuery(async () => {
    const where = projectId
      ? // Beware: projectId can be undefined and dexie does not like that
        { deleted: 0, project_id: projectId }
      : { deleted: 0 }
    const tables: Table[] = await dexie.ttables.where(where).toArray()

    const _layers = []
    for (const table of tables) {
      const rows: Row[] = await dexie.rows
        .filter(
          (row: Row) =>
            row.deleted === 0 && row.table_id === table.id && !!row.geometry,
        )
        .toArray()
      const layerStyle: LayerStyle = await dexie.layer_styles.get({
        table_id: table.id,
      })
      // convert geometry collection into feature collection to add properties (color)

      const features = rows.map((e) => {
        const properties = layerstyleToProperties({
          layerStyle,
          ...(e.id === rowId && { color: 'red' }),
        })
        console.log({ e, layerStyle, properties })
        return {
          geometry: e.geometry,
          type: 'Feature',
          // properties: { color: e.id === rowId ? 'red' : layerStyle.color },
          properties,
        }
      })
      const data = { type: 'FeatureCollection', features }

      if (rows.length)
        _layers.push(<TableLayer key={table.id} data={data} style={getStyle} />)
    }

    return _layers
  }, [projectId, rowId])

  // console.log('TableLayers rendering')

  return layers
}

export default TableLayers