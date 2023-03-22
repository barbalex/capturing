import React, { useCallback } from 'react'
import { FaPlus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { useParams, useNavigate, resolvePath } from 'react-router-dom'

import ErrorBoundary from '../../shared/ErrorBoundary'
import insertVectorLayer from '../../../utils/insertVectorLayer'

const VectorLayerAddButton = ({ userMayEdit }: { userMayEdit: boolean }) => {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const onClick = useCallback(async () => {
    const newId = await insertVectorLayer({
      projectId,
    })
    navigate(resolvePath(`../${newId}`, window.location.pathname))
  }, [navigate, projectId])

  return (
    <ErrorBoundary>
      <IconButton
        aria-label="neue Vektor-Karte"
        title="neue Vektor-Karte"
        onClick={onClick}
        size="large"
        disabled={!userMayEdit}
      >
        <FaPlus />
      </IconButton>
    </ErrorBoundary>
  )
}

export default VectorLayerAddButton
