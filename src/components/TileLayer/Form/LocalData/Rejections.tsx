import { useContext } from 'react'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'

import storeContext from '../../../../storeContext'
import { IStore } from '../../../../store'

const Error = styled.p`
  font-size: 0.75rem;
  color: #ff0000;
`
const Tip = styled.p`
  font-size: 0.75rem;
`

const Rejections = () => {
  const store: IStore = useContext(storeContext)
  const { localMapLoadingFulfilled, localMapLoadingRejected } = store

  if (localMapLoadingRejected > 0)
    return (
      <>
        <Error>{`${localMapLoadingFulfilled?.toLocaleString(
          'de-CH',
        )} Kacheln wurden geladen. ${localMapLoadingRejected?.toLocaleString(
          'de-CH',
        )} konnten nicht geladen werden.`}</Error>
        <Tip>
          👉 Möchten Sie den Vorgang wiederholen? Wenn es knapp war, könnte es
          das nächste mal gelingen.
        </Tip>
        <Tip>
          ℹ Je grösser der von Ihnen gewählte Ausschnitt ist, desto länger
          dauert der Download und um so wahrscheinlicher gibt es Probleme. Es
          gibt Grenzen beim Karten-Server, Ihrer Internet-Verbindung, Ihrem
          Gerät und Ihrer Geduld.
        </Tip>
        <Tip>
          👉 Manchmal lohnt es sich, statt einem grossen, mehrere kleinere
          Ausschnitte zu wählen.
        </Tip>
      </>
    )
}

export default observer(Rejections)
