import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import FilterTitle from '../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../dexieClient'

const FieldFormTitleChooser = () => {
  const { tableId } = useParams()
  const showFilter = false // TODO:

  const data = useLiveQuery(async () => {
    const [filteredCount, totalCount]: [number, number] = await Promise.all([
      dexie.fields.where({ deleted: 0, table_id: tableId }).count(), // TODO: pass in filter
      dexie.fields.where({ deleted: 0, table_id: tableId }).count(),
    ])

    return { filteredCount, totalCount }
  })
  const filteredCount = data?.filteredCount
  const totalCount = data?.totalCount

  if (showFilter) {
    return (
      <FilterTitle
        title="Feld"
        table="fields"
        totalCount={totalCount}
        filteredCount={filteredCount}
      />
    )
  }

  return <FormTitle totalCount={totalCount} filteredCount={filteredCount} />
}

export default FieldFormTitleChooser
