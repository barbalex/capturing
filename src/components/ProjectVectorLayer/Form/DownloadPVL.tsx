import React, { useContext, useEffect, useCallback, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import isEqual from 'lodash/isEqual'
import { Session } from '@supabase/supabase-js'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'
import Button from '@mui/material/Button'

import ErrorBoundary from '../../shared/ErrorBoundary'
import { dexie, ProjectVectorLayer, PVLGeom } from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'

type Props = {
  row: ProjectVectorLayer
}

// = '99999999-9999-9999-9999-999999999999'
const ProjectVectorLayerDownload = ({ row }: Props) => {
  const { projectVectorLayerId, projectId } = useParams()

  const session: Session = supabase.auth.session()

  // TODO: fetch pvl_geoms to see if data exists
  const data = useLiveQuery(async () => {
    const [pvlGeomsCount, projectUser] = await Promise.all([
      dexie.pvl_geoms
        .where({ deleted: 0, pvl_id: projectVectorLayerId })
        .count(),
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
      pvlGeomsCount,
      userMayEdit,
    }
  }, [projectId, projectVectorLayerId, session?.user?.email])

  const userMayEdit: boolean = data?.userMayEdit
  const pvlGeomsCount: number = data?.pvlGeomsCount

  const title =
    pvlGeomsCount > 0
      ? 'WFS-Features erneut herunterladen (um sie zu aktualisieren)'
      : 'WFS-Features für Offline-Nutzung herunterladen'

  const onClickDownload = useCallback(() => {
    // TODO:
  }, [])

  return (
    <ErrorBoundary>
      <Button
        variant="outlined"
        onClick={onClickDownload}
        disabled={!userMayEdit}
      >
        {title}
      </Button>
    </ErrorBoundary>
  )
}

export default observer(ProjectVectorLayerDownload)
