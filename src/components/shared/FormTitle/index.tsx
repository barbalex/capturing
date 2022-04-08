import React, { useContext, useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'

import StoreContext from '../../../storeContext'
import FilterTitle from '../../shared/FilterTitle'
import FormTitle from './FormTitle'

const ArtFormTitleChooser = ({ row, rawRow }) => {
  const store = useContext(StoreContext)
  const showFilter = false // TODO:
  const showHistory = false // TODO:
  const setShowHistory = () => {} // TODO:

  const [countState, setCountState] = useState({
    totalCount: 0,
    filteredCount: 0,
  })
  useEffect(() => {
    // setCountState({ totalCount, filteredCount })
  }, [])

  const { totalCount, filteredCount } = countState

  if (showFilter) {
    return (
      <FilterTitle
        title="Art"
        table="art"
        totalCount={totalCount}
        filteredCount={filteredCount}
      />
    )
  }

  return (
    <FormTitle
      row={row}
      rawRow={rawRow}
      totalCount={totalCount}
      filteredCount={filteredCount}
      showHistory={showHistory}
      setShowHistory={setShowHistory}
    />
  )
}

export default observer(ArtFormTitleChooser)
