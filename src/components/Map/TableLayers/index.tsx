import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import { dexie, Table, Row } from '../../../dexieClient'
import TableLayer from './TableLayer'

const TableLayers = () => {
  // bBeware: projectId can be undefined
  const { projectId } = useParams()

  const layers = useLiveQuery(async () => {
    const where = projectId
      ? { deleted: 0, project_id: projectId }
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

      if (rows.length)
        _layers.push(
          <TableLayer key={table.id} data={rows.map((e) => e.geometry)} />,
        )
    }

    return _layers
  }, [projectId])

  // console.log('TableLayers rendering')

  return layers
}

export default TableLayers
