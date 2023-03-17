import React, { useCallback, useContext } from 'react'
import IconButton from '@mui/material/IconButton'
import { useParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { orange } from '@mui/material/colors'

import ErrorBoundary from '../../shared/ErrorBoundary'
import storeContext from '../../../storeContext'
import EditIcon from '../../../images/icons/edit_project'
import { IStore } from '../../../store'

const ProjectEditButton = () => {
  const { projectId } = useParams()
  const store: IStore = useContext(storeContext)
  const { editingProjects, setProjectEditing } = store
  const editing = editingProjects.get(projectId)?.editing ?? false

  const onClick = useCallback(
    async () =>
      setProjectEditing({
        id: projectId,
        editing: !editing,
      }),
    [editing, projectId, setProjectEditing],
  )

  const label = editing
    ? 'Projekt-Struktur nicht bearbeiten'
    : 'Projekt-Struktur bearbeiten'

  return (
    <ErrorBoundary>
      <IconButton
        aria-label={label}
        title={label}
        onClick={onClick}
        size="large"
      >
        <EditIcon fill={editing ? orange[900] : 'rgba(0, 0, 0, 0.8)'} />
      </IconButton>
    </ErrorBoundary>
  )
}

export default observer(ProjectEditButton)
