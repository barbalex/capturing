import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import FilterTitle from '../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../dexieClient'

const ProjectFormTitleChooser = () => {
  const showFilter = false // TODO:

  const data = useLiveQuery(async () => {
    const [filteredCount, totalCount] = await Promise.all([
      dexie.projects.where({ deleted: 0 }).count(), // TODO: pass in filter
      dexie.projects.where({ deleted: 0 }).count(),
    ])

    return { filteredCount, totalCount }
  })
  const filteredCount = data?.filteredCount
  const totalCount = data?.totalCount

  if (showFilter) {
    return (
      <FilterTitle
        title="Projekt"
        table="projects"
        totalCount={totalCount}
        filteredCount={filteredCount}
      />
    )
  }

  return <FormTitle totalCount={totalCount} filteredCount={filteredCount} />
}

export default observer(ProjectFormTitleChooser)
