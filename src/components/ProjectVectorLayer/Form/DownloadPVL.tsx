import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useContext,
} from 'react'
import { observer } from 'mobx-react-lite'
import { Session } from '@supabase/supabase-js'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'
import Button from '@mui/material/Button'

import ErrorBoundary from '../../shared/ErrorBoundary'
import { dexie, ProjectVectorLayer } from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'
import downloadWfs from '../../../utils/downloadWfs'
import storeContext from '../../../storeContext'

type Props = {
  row: ProjectVectorLayer
}

// = '99999999-9999-9999-9999-999999999999'
const ProjectVectorLayerDownload = ({ row }: Props) => {
  const store = useContext(storeContext)
  const { projectVectorLayerId, projectId } = useParams()

  const session: Session = supabase.auth.session()

  const [actionTitle, setActionTitle] = useState()

  // fetch pvl_geoms to see if data exists
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

  const title = actionTitle
    ? actionTitle
    : pvlGeomsCount
    ? 'WFS-Features erneut herunterladen (wenn sie aktualisiert werden sollen)'
    : 'WFS-Features für Offline-Nutzung herunterladen'

  const timeoutRef = useRef()
  const onClickDownload = useCallback(async () => {
    setActionTitle('WFS-Features werden heruntergeladen...')
    const worked = await downloadWfs({ pvl: row, store })
    if (worked) {
      setActionTitle('WFS-Features wurden heruntergeladen')
      timeoutRef.current = setTimeout(() => setActionTitle(undefined), 30000)
    } else {
      setActionTitle(undefined)
    }
  }, [row, store])
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <ErrorBoundary>
      <Button
        variant="outlined"
        onClick={onClickDownload}
        disabled={
          !(
            userMayEdit &&
            row.output_format &&
            row.type_name &&
            row.url &&
            row.wfs_version
          )
        }
      >
        {title}
      </Button>
    </ErrorBoundary>
  )
}

export default observer(ProjectVectorLayerDownload)
