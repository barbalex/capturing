import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { FaPlus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'

import StoreContext from '../../../storeContext'
import ErrorBoundary from '../../shared/ErrorBoundary'
import insertProject from '../../../utils/insertProject'
import { dexie, IAccount } from '../../../dexieClient'

const ProjectAddButton = () => {
  const { activeNodeArray, setActiveNodeArray } = useContext(StoreContext)

  const onClick = useCallback(async () => {
    const account: IAccount = await dexie.accounts.toCollection().first()
    const newProjectId = await insertProject({ account })
    setActiveNodeArray([...activeNodeArray.slice(0, -1), newProjectId])
  }, [activeNodeArray, setActiveNodeArray])

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
