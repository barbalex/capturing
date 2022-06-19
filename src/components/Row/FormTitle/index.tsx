import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

// import storeContext from '../../../storeContext'
import FilterTitle from '../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../dexieClient'

const RowFormTitleChooser = ({ row, showHistory,setShowHistory }) => {
  const { projectId, tableId } = useParams()
  // const store = useContext(storeContext)
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
    />
  )
}

export default observer(RowFormTitleChooser)
