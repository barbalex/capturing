import { useCallback, useContext, useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'

import storeContext from '../../../storeContext'
import Label from '../../shared/Label'
import { Comment } from '../../Table/Form'
import { dexie, TileLayer } from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'

const WmtsButtonsContainer = styled.div`
  margin-bottom: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`
const NotDownloadedWarning = styled.p`
  font-size: 0.75rem;
  color: #ff0000;
`

const LocalData = ({ userMayEdit, row }) => {
  const session = supabase.auth.session()
  const store = useContext(storeContext)
  const {
    localMaps,
    showMap,
    localMapLoadingFraction,
    localMapLoadingFulfilled,
    localMapLoadingRejected,
  } = store

  /**
   * TODO: local maps
   * 1. get size from dexie
   * 2. show it
   * 3. save bounds
   * 4. enable showing bounds on map
   * 5. enable choosing what zooms to save?
   * 6. enable syncing local maps?
   */

  const localMap = localMaps?.[row.id]
  const [showProgress, setShowProgress] = useState(false)
  const [downloading, setDownloading] = useState(false)
  useEffect(() => {
    let timeoutID
    if (localMapLoadingFraction === 1) {
      setDownloading(false)
      timeoutID = setTimeout(() => setShowProgress(false), 3000)
    }

    return () => {
      if (timeoutID) clearTimeout(timeoutID)
    }
  }, [localMapLoadingFraction])

  const onClickSaveWmts = useCallback(() => {
    setDownloading(true)
    setShowProgress(true)
    localMap?.save?.()
  }, [localMap])

  const onClickDeleteWmts = useCallback(async () => {
    localMap?.del?.()
    const was = { ...row }
    await dexie.tile_layers.update(row.id, {
      local_data_size: null,
      local_data_bounds: null,
    })
    const is: TileLayer = dexie.tile_layers.get(row.id)
    row.updateOnServer({ was, is, session })
  }, [localMap, row, session])

  if (showMap && userMayEdit) {
    const mb = row.local_data_size
      ? (+(row.local_data_size / 1000000)).toFixed(1)?.toLocaleString?.('de-CH')
      : 0
    const saveText = downloading
      ? 'Aktueller Ausschnitt wird gespeichert...'
      : mb
      ? 'Aktuellen Ausschnitt (zusätzlich) speichern'
      : 'Aktuellen Ausschnitt speichern'

    return (
      <>
        <Label label="Offline-Daten" />
        {showProgress && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={localMapLoadingFraction * 100}
              />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">{`${Math.round(
                localMapLoadingFraction * 100,
              )}%`}</Typography>
            </Box>
          </Box>
        )}
        {localMapLoadingRejected > 0 && (
          <NotDownloadedWarning>{`${localMapLoadingFulfilled?.toLocaleString(
            'de-CH',
          )} Kacheln wurden geladen. ${localMapLoadingRejected?.toLocaleString(
            'de-CH',
          )} konnten nicht geladen werden. Möchten Sie den Vorgang wiederholen?`}</NotDownloadedWarning>
        )}
        <Comment>{`Aktuell: ${mb} Megabyte`}</Comment>
        <WmtsButtonsContainer>
          <Button variant="outlined" onClick={onClickSaveWmts}>
            {saveText}
          </Button>
          <Button variant="outlined" onClick={onClickDeleteWmts} disabled={!mb}>
            Lokal gespeicherte Kartenausschnitte löschen
          </Button>
        </WmtsButtonsContainer>
      </>
    )
  }
}

export default observer(LocalData)
