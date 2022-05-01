import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import { dexie, Table } from '../../../dexieClient'
import sortByLabelName from '../../../utils/sortByLabelName'

const TableLayers = () => {
  const { projectId } = useParams()

  const tables: Table[] = useLiveQuery(
    async () =>
      await dexie.ttables
        .where({ deleted: 0, project_id: projectId })
        .toArray(),
    [projectId],
  )
  const tablesSorted = sortByLabelName({
    objects: tables,
    useLabels,
  })

  return null
}

export default TableLayers
