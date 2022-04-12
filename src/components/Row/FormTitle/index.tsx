import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

// import StoreContext from '../../../storeContext'
import FilterTitle from '../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../dexieClient'

const ProjectFormTitleChooser = ({ row }) => {
  // const store = useContext(StoreContext)
  const showFilter = false // TODO:
  const showHistory = false // TODO:
  const setShowHistory = useCallback(() => {
    // TODO:
  }, [])

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

  return (
    <FormTitle
      row={row}
      totalCount={totalCount}
      filteredCount={filteredCount}
      showHistory={showHistory}
      setShowHistory={setShowHistory}
    />
  )
}

export default observer(ProjectFormTitleChooser)