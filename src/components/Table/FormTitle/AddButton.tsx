import React, { useCallback } from 'react'
import { FaPlus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { useParams, useNavigate } from 'react-router-dom'

import ErrorBoundary from '../../shared/ErrorBoundary'
import insertTable from '../../../utils/insertTable'

const TableAddButton = ({ userMayEdit }) => {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const onClick = useCallback(async () => {
    const newProjectId = await insertTable({ projectId })
    navigate(resolvePath(`../${newProjectId}`, window.location.pathname))
  }, [navigate, projectId])

  return (
    <ErrorBoundary>
      <IconButton
        aria-label="neue Tabelle"
        title="neue Tabelle"
        onClick={onClick}
        size="large"
        disabled={!userMayEdit}
      >
        <FaPlus />
      </IconButton>
    </ErrorBoundary>
  )
}

export default TableAddButton
