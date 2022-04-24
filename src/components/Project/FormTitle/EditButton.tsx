import React, { useCallback, useContext } from 'react'
import IconButton from '@mui/material/IconButton'
import { MdBuild } from 'react-icons/md'
import { useParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { toJS } from 'mobx'

import ErrorBoundary from '../../shared/ErrorBoundary'
import storeContext from '../../../storeContext'

const ProjectEditButton = () => {
  const { projectId } = useParams()
  const store = useContext(storeContext)
  const { editingProjects, setProjectEditing } = store
  const editing = editingProjects.get(projectId).editing

  const onClick = useCallback(
    async () =>
      setProjectEditing({
        id: projectId,
        editing: !editing,
      }),
    [editing, projectId, setProjectEditing],
  )

  const label = editing
    ? 'Nur Projekt-Daten bearbeiten'
    : 'Projekt-Struktur bearbeiten'

  return (
    <ErrorBoundary>
      <IconButton
        aria-label={label}
        title={label}
        onClick={onClick}
        size="large"
        color={editing ? 'secondary' : 'default'}
      >
        <MdBuild />
      </IconButton>
    </ErrorBoundary>
  )
}

export default observer(ProjectEditButton)
