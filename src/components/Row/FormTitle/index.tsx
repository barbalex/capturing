import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import FilterTitle from '../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../dexieClient'

const RowFormTitleChooser = ({ row, showHistory, setShowHistory, level }) => {
  const params = useParams()
  const projectId = params.projectId
  const tableId = params[`tableId${level}`]
  const showFilter = false // TODO:

  const data = useLiveQuery(async () => {
    const [filteredCount, totalCount, project, table] = await Promise.all([
      dexie.projects.where({ deleted: 0 }).count(), // TODO: pass in filter
      dexie.projects.where({ deleted: 0 }).count(),
      dexie.projects.get(projectId),
      dexie.ttables.get(tableId),
    ])

    return { filteredCount, totalCount, project, table }
  })
  const filteredCount = data?.filteredCount
  const totalCount = data?.totalCount

  if (showFilter) {
    return (
      <FilterTitle
        title="Datensatz"
        table="rows"
        totalCount={totalCount}
        filteredCount={filteredCount}
      />
    )
  }

  const project = data?.project
  const table = data?.table

  if (!project) return null

  return (
    <FormTitle
      row={row}
      totalCount={totalCount}
      filteredCount={filteredCount}
      project={project}
      table={table}
      showHistory={showHistory}
      setShowHistory={setShowHistory}
      level={level}
    />
  )
}

export default RowFormTitleChooser
