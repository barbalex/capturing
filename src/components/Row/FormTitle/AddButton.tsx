import React, { useCallback } from 'react'
import { FaPlus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { useParams, useNavigate } from 'react-router-dom'

import ErrorBoundary from '../../shared/ErrorBoundary'
import insertRow from '../../../utils/insertRow'

const RowAddButton = () => {
  const { tableId } = useParams()
  const navigate = useNavigate()

  const onClick = useCallback(async () => {
    const newId = await insertRow({ tableId })
    navigate(resolvePath(`../${newId}`, window.location.pathname))
  }, [navigate, tableId])

  return (
    <ErrorBoundary>
      <IconButton
        aria-label="neuen Datensatz"
        title="neuen Datensatz"
        onClick={onClick}
        size="large"
      >
        <FaPlus />
      </IconButton>
    </ErrorBoundary>
  )
}

export default RowAddButton
