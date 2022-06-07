import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import { dexie, Table, Row, LayerStyle, Field } from '../../../dexieClient'
import TableLayer from './TableLayer'
import layerstyleToProperties from '../../../utils/layerstyleToProperties'
import dataToProperties from './dataToProperties'

const getStyle = (feature) => ({
  ...(feature.properties?.style ?? {}),
})

const TableLayers = () => {
  const { projectId, rowId } = useParams()

  const layers = useLiveQuery(async () => {
    const conditions = projectId
      ? // Beware: projectId can be undefined and dexie does not like that
        { deleted: 0, project_id: projectId }
      : { deleted: 0 }
    const tables: Table[] = await dexie.ttables.where(conditions).toArray()

    const _layers = []
    for (const table of tables) {
      const rows: Row[] =
        (await dexie.rows
          .filter(
            (row: Row) =>
              row.deleted === 0 && row.table_id === table.id && !!row.geometry,
          )
          .toArray()) ?? []
      const layerStyle: LayerStyle = await dexie.layer_styles.get({
        table_id: table.id,
      })
      const richTextFields: Field[] = await dexie.fields
        .where({
          table_id: table.id,
          widget_type: 'rich-text',
        })
        .toArray()

      console.log('TableLayers', { table, layerStyle, richTextFields })
      // convert geometry collection into feature collection to add properties (color)

      if (rows.length) {
        const data = {
          type: 'FeatureCollection',
          features: rows.map((row) => ({
            geometry: row.geometry,
            type: 'Feature',
            properties: {
              style: layerstyleToProperties({
                layerStyle,
                extraProps: row.id === rowId ? { color: 'red' } : {},
              }),
              // TODO: rtf-field needs to be stringified
              ...dataToProperties({ row, richTextFields }),
            },
          })),
        }

        _layers.push(
          <TableLayer
            key={table.id}
            data={data}
            table={table}
            style={getStyle}
            layerStyle={layerStyle}
            richTextFields={richTextFields}
          />,
        )
      }
    }

    return _layers
  }, [projectId, rowId])

  return layers
}

export default TableLayers
