import React, { useCallback } from 'react'
import { FaPlus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { useParams, useNavigate, resolvePath } from 'react-router-dom'

import ErrorBoundary from '../../shared/ErrorBoundary'
import insertProjectTileLayer from '../../../utils/insertTileLayer'

const ProjectTileLayerAddButton = ({ userMayEdit }) => {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const onClick = useCallback(async () => {
    const newId = await insertProjectTileLayer({
      projectId,
    })
    navigate(resolvePath(`../${newId}`, window.location.pathname))
  }, [navigate, projectId])

  return (
    <ErrorBoundary>
      <IconButton
        aria-label="neue Bild-Karte"
        title="neue Bild-Karte"
        onClick={onClick}
        size="large"
        disabled={!userMayEdit}
      >
        <FaPlus />
      </IconButton>
    </ErrorBoundary>
  )
}

export default ProjectTileLayerAddButton
