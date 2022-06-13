import { useCallback, useContext } from 'react'
import Button from '@mui/material/Button'
import styled from 'styled-components'

import storeContext from '../../../storeContext'
import Label from '../../shared/Label'
import { Comment } from '../../Table/Form'

const WmtsButtonsContainer = styled.div`
  margin-bottom: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const LocalData = ({ userMayEdit, row }) => {
  const store = useContext(storeContext)
  const { localMaps, showMap } = store

  /**
   * TODO: local maps
   * 1. get size from dexie
   * 2. show it
   * 3. save bounds
   * 4. enable showing bounds on map
   * 5. enable choosing what zooms to save?
   * 6. enable syncing local maps?
   */

  const onClickSaveWmts = useCallback(() => {
    localMaps?.[row.id]?.save?.()
  }, [localMaps, row.id])

  const onClickDeleteWmts = useCallback(() => {
    localMaps?.[row.id]?.del?.()
  }, [localMaps, row.id])

  if (showMap && userMayEdit) {
    let mb = 0
    if (row.local_data_size) {
      mb = (row.local_data_size / 1000000)?.toLocaleString?.('de-CH')
    }

    return (
      <>
        <Label label="Offline-Daten" />
        <Comment>{`Aktuell: ${mb} Megabytes`}</Comment>
        <WmtsButtonsContainer>
          <Button variant="outlined" onClick={onClickSaveWmts}>
            Aktuellen Ausschnitt (zusätzlich) speichern
          </Button>
          <Button variant="outlined" onClick={onClickDeleteWmts}>
            Lokal gespeicherte Kartenausschnitte löschen
          </Button>
        </WmtsButtonsContainer>
      </>
    )
  }
}

export default LocalData
