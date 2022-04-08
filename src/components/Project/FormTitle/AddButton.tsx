import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { FaPlus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'

import StoreContext from '../../../storeContext'
import ErrorBoundary from '../../shared/ErrorBoundary'

const ProjectAddButton = () => {
  const store = useContext(StoreContext)
  const onClick = useCallback(() => {
    console.log('TODO: insert new project')
  }, [])

  return (
    <ErrorBoundary>
      <IconButton
        aria-label="neues Projekt"
        title="neues Projekt"
        onClick={onClick}
        size="large"
      >
        <FaPlus />
      </IconButton>
    </ErrorBoundary>
  )
}

export default observer(ProjectAddButton)
