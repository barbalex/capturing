import { useCallback, useContext, useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
// import { getSnapshot } from 'mobx-state-tree'

import storeContext from '../../../../storeContext'
import { Comment } from '../../../Table/Form'
import { dexie, TileLayer } from '../../../../dexieClient'
import { supabase } from '../../../../supabaseClient'
import { ProcessingText } from '../../../VectorLayer/Form/DownloadPVL'
import constants from '../../../../utils/constants'
import Rejections from './Rejections'
import Progress from './Progress'
import { layerGroup } from 'leaflet'

const Container = styled.div`
  margin: 25px -10px 0 -10px;
`
const TitleRow = styled.div`
  background-color: rgba(248, 243, 254, 1);
  flex-shrink: 0;
  display: flex;
  height: ${constants.titleRowHeight}px;
  justify-content: space-between;
  padding: 0 10px;
  cursor: pointer;
  user-select: none;
  position: sticky;
  top: -10px;
  z-index: 4;
  &:first-of-type {
    margin-top: -10px;
  }
`
const Title = styled.div`
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
`
const FieldsContainer = styled.div`
  padding: 2px 10px 10px 10px;
`
const WmtsButtonsContainer = styled.div`
  margin-bottom: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`
const Error = styled.p`
  font-size: 0.75rem;
  color: #ff0000;
`
const Warning = styled.p`
  font-size: 0.75rem;
  color: #ff7700;
  text-shadow: 0.1px 0.1px 0.1px black;
`
const StyledFormGroup = styled(FormGroup)`
  margin-bottom: 10px;
  label .MuiFormControlLabel-label {
    font-size: 0.75rem;
    color: rgba(0, 0, 0, 0.8);
  }
`

type Props = {
  userMayEdit: boolean
  row: TileLayer
}

const LocalData = ({ userMayEdit, row }: Props) => {
  const session = supabase.auth.session()
  const store = useContext(storeContext)
  const {
    localMaps,
    showMap,
    setLocalMapLoading,
    mapZoom,
    setLocalMapShow,
    localMapShow,
  } = store

  useEffect(() => setLocalMapLoading(), [setLocalMapLoading])

  /**
   * TODO: local maps
   * 1. get size from dexie ✔
   * 2. show it ✔
   * 3. save bounds ✔
   * 4. enable showing bounds on map
   * 5. enable syncing local maps?
   */

  const localMap = localMaps?.[row.id]
  const [showProgress, setShowProgress] = useState(false)
  const [downloading, setDownloading] = useState(false)

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
    setShowProgress(false)
    setDownloading(false)
  }, [localMap, row, session, setLocalMapLoading])

  const onClickShow = useCallback(
    (event) => {
      setLocalMapShow({ id: row.id, show: event.target.checked })
    },
    [row.id, setLocalMapShow],
  )

  if (showMap && userMayEdit) {
    const mb = row.local_data_size
      ? (+(row.local_data_size / 1000000)).toFixed(1)?.toLocaleString?.('de-CH')
      : 0
    const saveText = downloading
      ? 'Aktueller Ausschnitt wird heruntergeladen...'
      : mb
      ? 'Aktuellen Ausschnitt (zusätzlich) offline verfügbar machen'
      : 'Aktuellen Ausschnitt offline verfügbar machen'

    // console.log('TileLayer, localMapShow:', getSnapshot(localMapShow))

    return (
      <Container>
        <TitleRow>
          <Title>Offline-Daten</Title>
        </TitleRow>
        <FieldsContainer>
          <Progress
            showProgress={showProgress}
            setShowProgress={setShowProgress}
            setDownloading={setDownloading}
          />
          <Rejections />
          <Comment>{`Aktuell: ${mb} Megabyte`}</Comment>
          <StyledFormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={localMapShow.get(row.id)?.show ?? false}
                  onClick={onClickShow}
                />
              }
              label="Offline verfügbare Bereiche in der Karte anzeigen"
            />
          </StyledFormGroup>
          {mapZoom < 14 && (
            <Error>
              ❗Sie müssen näher zoomen, damit der Download gelingt.
            </Error>
          )}
          {mapZoom < 16 && mapZoom >= 14 && (
            <Warning>
              ℹ Sie müssen vermutlich näher zoomen, damit der Download gelingt.
            </Warning>
          )}
          {!row.active && (
            <Warning>
              ℹ Sie müssen den Layer aktivieren, um ihn herunterladen zu können.
            </Warning>
          )}
          <WmtsButtonsContainer>
            <Button
              variant="outlined"
              onClick={onClickSaveWmts}
              disabled={mapZoom < 14 || !row.active}
            >
              <ProcessingText data-loading={downloading}>
                {saveText}
              </ProcessingText>
            </Button>
            <Button
              variant="outlined"
              onClick={onClickDeleteWmts}
              disabled={!mb}
            >
              Lokal gespeicherte Kartenausschnitte löschen
            </Button>
          </WmtsButtonsContainer>
        </FieldsContainer>
      </Container>
    )
  }
}

export default observer(LocalData)
