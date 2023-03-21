import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import FilterTitle from '../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../dexieClient'

const TableFormTitleChooser = () => {
  const { projectId } = useParams()
  const showFilter = false // TODO:

  const data = useLiveQuery(async () => {
    const [filteredCount, totalCount]: [number, number] = await Promise.all([
      dexie.ttables.where({ deleted: 0, project_id: projectId }).count(), // TODO: pass in filter
      dexie.ttables.where({ deleted: 0, project_id: projectId }).count(),
    ])

    return { filteredCount, totalCount }
  })
  const filteredCount = data?.filteredCount
  const totalCount = data?.totalCount

  if (showFilter) {
    return (
      <FilterTitle
        title="Tabelle"
        table="tables"
        totalCount={totalCount}
        filteredCount={filteredCount}
      />
    )
  }

  return <FormTitle totalCount={totalCount} filteredCount={filteredCount} />
}

export default TableFormTitleChooser
