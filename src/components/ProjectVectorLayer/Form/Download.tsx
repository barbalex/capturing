import React, { useContext, useEffect, useCallback, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import isEqual from 'lodash/isEqual'
import { Session } from '@supabase/supabase-js'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'
import Button from '@mui/material/Button'

import ErrorBoundary from '../../shared/ErrorBoundary'
import { dexie, ProjectVectorLayer } from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'

type Props = {
  row: ProjectVectorLayer
}

// = '99999999-9999-9999-9999-999999999999'
const ProjectVectorLayerDownload = ({ row }: Props) => {
  const { projectId, projectVectorLayerId } = useParams()

  const session: Session = supabase.auth.session()

  // const data = {}
  const data = useLiveQuery(async () => {
    const [row, projectUser] = await Promise.all([
      dexie.project_vector_layers.get(projectVectorLayerId),
      dexie.project_users.get({
        project_id: projectId,
        user_email: session?.user?.email,
      }),
    ])

    const userRole = projectUser?.role
    const userMayEdit = ['account_manager', 'project_manager'].includes(
      userRole,
    )

    return {
      row,
      userMayEdit,
    }
  }, [projectId, projectVectorLayerId, session?.user?.email])

  const onClickDownload = useCallback(() => {
    // TODO:
  }, [])

  return (
    <ErrorBoundary>
      <Button variant="outlined" onClick={onClickDownload}>
        Daten für Offline-Nutzung herunterladen
      </Button>
    </ErrorBoundary>
  )
}

export default observer(ProjectVectorLayerDownload)
