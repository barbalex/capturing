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
import { ProcessingText } from '../../VectorLayer/Form/DownloadPVL'

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
const Tip = styled.p`
  font-size: 0.75rem;
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
    setLocalMapLoading,
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
    setLocalMapLoading()
    setDownloading(true)
    setShowProgress(true)
    localMap?.save?.()
  }, [localMap, setLocalMapLoading])

  const onClickDeleteWmts = useCallback(async () => {
    localMap?.del?.()
    const was = { ...row }
    await dexie.tile_layers.update(row.id, {
      local_data_size: null,
      local_data_bounds: null,
    })
    const is: TileLayer = dexie.tile_layers.get(row.id)
    row.updateOnServer({ was, is, session })
    setLocalMapLoading()
  }, [localMap, row, session, setLocalMapLoading])

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
          <>
            <NotDownloadedWarning>{`${localMapLoadingFulfilled?.toLocaleString(
              'de-CH',
            )} Kacheln wurden geladen. ${localMapLoadingRejected?.toLocaleString(
              'de-CH',
            )} konnten nicht geladen werden.`}</NotDownloadedWarning>
            <Tip>
              👉 Möchten Sie den Vorgang wiederholen? Wenn es knapp war, könnte
              es das nächste mal gelingen.
            </Tip>
            <Tip>
              ℹ Je grösser der von Ihnen gewählte Ausschnitt ist, desto länger
              dauert der Download und desto wahrscheinlicher gibt es Probleme.
              Es gibt Grenzen beim Karten-Server, Ihrer Internet-Verbindung,
              Ihrem Gerät und Ihrer Geduld.
            </Tip>
            <Tip>
              👉 Manchmal lohnt es sich, statt einem grossen, mehrere kleinere
              Ausschnitte zu wählen.
            </Tip>
          </>
        )}
        <Comment>{`Aktuell: ${mb} Megabyte`}</Comment>
        <WmtsButtonsContainer>
          <Button variant="outlined" onClick={onClickSaveWmts}>
            <ProcessingText data-loading={downloading}>
              {saveText}
            </ProcessingText>
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
