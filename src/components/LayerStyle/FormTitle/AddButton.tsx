import React, { useCallback } from 'react'
import { FaPlus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { resolvePath, useNavigate } from 'react-router-dom'

import ErrorBoundary from '../../shared/ErrorBoundary'
import insertProject from '../../../utils/insertProject'
import { dexie, IAccount } from '../../../dexieClient'

const ProjectAddButton = () => {
  const navigate = useNavigate()

  const onClick = useCallback(async () => {
    const account: IAccount = await dexie.accounts.toCollection().first()
    const newProjectId = await insertProject({ account })
    navigate(resolvePath(`../${newProjectId}`, window.location.pathname))
  }, [navigate])

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
