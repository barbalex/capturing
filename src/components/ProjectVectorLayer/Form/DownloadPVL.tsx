import React, { useState, useCallback, useRef, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Session } from '@supabase/supabase-js'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'
import Button from '@mui/material/Button'
import axios from 'redaxios'

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
    // 1. empty this pvl's geoms
    await dexie.pvl_geoms
      .where({ deleted: 0, pvl_id: projectVectorLayerId })
      .delete()
    // 2. fetch features
    let res
    try {
      res = await axios({
        method: 'get',
        url: row.url,
        params: {
          service: 'WFS',
          version: row.wfs_version,
          request: 'GetFeature',
          typeName: row.type_name,
          srsName: 'EPSG:4326',
          outputFormat: row.output_format,
        },
      })
    } catch (error) {
      // console.log(`error fetching ${row.label}`, error?.toJSON())
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data)
        console.log(error.response.status)
        console.log(error.response.headers)
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request)
      } else {
        // Something happened in setting up the request that triggered an Error
        // TODO: surface
        console.log('Error', error.message)
      }
      // console.log(error.config)
      setActionTitle(undefined)
      return
    }
    const features = res.data?.features
    // 3. build PVLGeoms
    const pvlGeoms = features.map(
      (feature) =>
        new PVLGeom(
          undefined,
          projectVectorLayerId,
          feature.geometry,
          feature.properties,
        ),
    )
    // 4. add to dexie
    await dexie.pvl_geoms.bulkPut(pvlGeoms)
    setActionTitle('WFS-Features wurden heruntergeladen')
    timeoutRef.current = setTimeout(() => setActionTitle(undefined), 30000)
  }, [
    projectVectorLayerId,
    row.output_format,
    row.type_name,
    row.url,
    row.wfs_version,
  ])
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
        disabled={!userMayEdit}
      >
        {title}
      </Button>
    </ErrorBoundary>
  )
}

export default observer(ProjectVectorLayerDownload)
