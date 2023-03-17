import React, { useCallback, useContext } from 'react'
import { FaPlus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { resolvePath, useNavigate } from 'react-router-dom'

import ErrorBoundary from '../../shared/ErrorBoundary'
import insertProject from '../../../utils/insertProject'
import { dexie, IAccount } from '../../../dexieClient'
import storeContext from '../../../storeContext'
import { IStore } from '../../../store'

const ProjectAddButton = () => {
  const navigate = useNavigate()

  const store: IStore = useContext(storeContext)
  const { setProjectEditing } = store

  const onClick = useCallback(async () => {
    const account: IAccount = await dexie.accounts.toCollection().first()
    const newProjectId = await insertProject({ account })
    navigate(resolvePath(`../${newProjectId}`, window.location.pathname))
    setProjectEditing({
      id: newProjectId,
      editing: true,
    })
  }, [navigate, setProjectEditing])

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

export default ProjectAddButton
