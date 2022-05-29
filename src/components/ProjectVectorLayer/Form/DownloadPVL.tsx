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
import styled from 'styled-components'

import ErrorBoundary from '../../shared/ErrorBoundary'
import Label from '../../shared/Label'
import { dexie, ProjectVectorLayer } from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'
import downloadWfs from '../../../utils/downloadWfs'
import storeContext from '../../../storeContext'

export const DownloadingText = styled.span`
  ${(props) =>
    props['data-loading'] &&
    `font-style: italic;
  animation: blinker 1s linear infinite; 
  white-space: nowrap;
  @keyframes blinker {
    50% {
      opacity: 0;
    }
  }`}
`

const OfflineReadyText = styled.p`
  margin-top: 0;
`
const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`
const UL = styled.ul`
  margin-top: -10px;
  font-size: small;
`
const LI = styled.li``

type Props = {
  row: ProjectVectorLayer
}

// = '99999999-9999-9999-9999-999999999999'
const ProjectVectorLayerDownload = ({ row }: Props) => {
  const store = useContext(storeContext)
  const { projectVectorLayerId, projectId } = useParams()

  const session: Session = supabase.auth.session()

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

  const [downloading, setDownloading] = useState(false)

  const [removing, setRemoving] = useState(false)
  const removeText = removing ? 'Daten werden entfernt...' : 'Daten entfernen'

  const onClickDownload = useCallback(async () => {
    setDownloading(true)
    await downloadWfs({ pvl: row, store })
    setDownloading(false)
  }, [row, store])

  const onClickDelete = useCallback(async () => {
    setRemoving(true)
    await dexie.pvl_geoms
      .where({ deleted: 0, pvl_id: projectVectorLayerId })
      .delete()
    setRemoving(false)
  }, [projectVectorLayerId])

  const offlineReadyText = pvlGeomsCount
    ? 'Die Daten sind offline verfügbar:'
    : 'Die Daten sind nicht offline verfügbar.'

  return (
    <ErrorBoundary>
      <Label label="Offline-Verfügbarkeit" />
      <OfflineReadyText>{offlineReadyText}</OfflineReadyText>
      {!!pvlGeomsCount && (
        <UL>
          <LI>{`${new Intl.NumberFormat('de-CH').format(
            row.feature_count,
          )} Geometrien`}</LI>
          <LI>{`${new Intl.NumberFormat('de-CH').format(
            row.point_count ?? 0,
          )} Punkte`}</LI>
          <LI>{`${new Intl.NumberFormat('de-CH').format(
            row.line_count ?? 0,
          )} Linien`}</LI>
          <LI>{`${new Intl.NumberFormat('de-CH').format(
            row.polygon_count ?? 0,
          )} Polygone`}</LI>
        </UL>
      )}
      <ButtonRow>
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
          <DownloadingText data-loading={downloading}>
            {downloading
              ? 'Daten werden heruntergeladen...'
              : pvlGeomsCount
              ? 'Daten erneut herunterladen (aktualisieren)'
              : 'Daten für Offline-Nutzung herunterladen'}
          </DownloadingText>
        </Button>
        <Button
          variant="outlined"
          onClick={onClickDelete}
          disabled={!pvlGeomsCount}
        >
          <DownloadingText data-loading={removing}>
            {removeText}
          </DownloadingText>
        </Button>
      </ButtonRow>
    </ErrorBoundary>
  )
}

export default observer(ProjectVectorLayerDownload)
