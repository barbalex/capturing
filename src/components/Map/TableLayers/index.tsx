import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import { dexie, Table } from '../../../dexieClient'
import sortByLabelName from '../../../utils/sortByLabelName'
import TableLayer from './TableLayer'

const TableLayers = () => {
  const { projectId } = useParams()

  const layers = useLiveQuery(async () => {
    const [tables, project] = await Promise.all([
      dexie.ttables.where({ deleted: 0, project_id: projectId }).toArray(),
      dexie.projects.get(projectId),
    ])
    const tablesSorted: Table[] = sortByLabelName({
      objects: tables,
      useLabels: project.use_labels,
    })

    const layers = []
    for (const table of tablesSorted) {
      const data = await dexie.rows
        .filter(
          (row) =>
            row.deleted === 0 && row.table_id === table.id && !!row.geometry,
        )
        .toArray()

      if (data.length)
        layers.push(
          <TableLayer
            key={table.id}
            data={data.map((e) => e.geometry)}
            table={table}
          />,
        )
    }

    return layers
  }, [projectId])

  // console.log('TableLayers rendering')

  return layers
}

export default TableLayers
