import React, { useCallback } from 'react'
import { FaPlus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { useParams, useNavigate, resolvePath } from 'react-router-dom'

import ErrorBoundary from '../../shared/ErrorBoundary'
import insertField from '../../../utils/insertField'

const FieldAddButton = ({ userMayEdit }) => {
  const { tableId } = useParams()
  const navigate = useNavigate()

  const onClick = useCallback(async () => {
    const newId = await insertField({ tableId })
    navigate(resolvePath(`../${newId}`, window.location.pathname))
  }, [navigate, tableId])

  return (
    <ErrorBoundary>
      <IconButton
        aria-label="neues Feld"
        title="neues Feld"
        onClick={onClick}
        size="large"
        disabled={!userMayEdit}
      >
        <FaPlus />
      </IconButton>
    </ErrorBoundary>
  )
}

export default FieldAddButton
