import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { FaPlus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'

import StoreContext from '../../../storeContext'
import ErrorBoundary from '../../shared/ErrorBoundary'

const ProjectAddButton = () => {
  const store = useContext(StoreContext)
  const { insertArtRev } = store

  return (
    <ErrorBoundary>
      <IconButton
        aria-label="neues Projekt"
        title="neues Projekt"
        onClick={insertArtRev}
        size="large"
      >
        <FaPlus />
      </IconButton>
    </ErrorBoundary>
  )
}

export default observer(ProjectAddButton)
