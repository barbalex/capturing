import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

// import StoreContext from '../../../storeContext'
import FilterTitle from '../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../dexieClient'

const ProjectFormTitleChooser = ({ row, userMayEdit }) => {
  // const store = useContext(StoreContext)
  const showFilter = false // TODO:

  const data = useLiveQuery(async () => {
    const [filteredCount, totalCount] = await Promise.all([
      dexie.ttables.where({ deleted: 0 }).count(), // TODO: pass in filter
      dexie.ttables.where({ deleted: 0 }).count(),
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

  return (
    <FormTitle
      row={row}
      totalCount={totalCount}
      filteredCount={filteredCount}
      userMayEdit={userMayEdit}
    />
  )
}

export default observer(ProjectFormTitleChooser)
