import { useEffect, useContext, useCallback, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FaTimes } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import { IoMdInformationCircleOutline } from 'react-icons/io'
import styled from '@emotion/styled'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'

import { dexie, QueuedUpdate, tables } from '../../dexieClient'
import StoreContext from '../../storeContext'
import Login from '../../components/Login'
import constants from '../../utils/constants'
import { IStoreSnapshotOut } from '../../store'
import QueuedUpdateComponent from './QueuedUpdate'

const Container = styled.div`
  min-height: calc(100vh - ${constants.appBarHeight}px);
  position: relative;
`
const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
`
const Title = styled.h3`
  padding: 15px 15px 0 15px;
  margin: 0;
`
const NoOpsContainer = styled.div`
  padding: 30px 15px !important;
  grid-column: 1 / -1;
`
const OuterContainer = styled.div`
  height: calc(100vh - ${constants.appBarHeight}px - 52px);
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
`
const QueriesContainer = styled.div`
  padding: 0 15px;
  display: grid;
  grid-template-columns: 5em 1fr 1fr 1fr 1fr 1fr 1fr 1fr 5em;
  grid-template-rows: 1fr;
  column-gap: 16px;
  > div:nth-of-type(9n + 1) {
    margin: 0 -8px 0 0;
    padding: 5px 8px 5px 0;
  }
  > div:nth-of-type(9n + 2),
  > div:nth-of-type(9n + 3),
  > div:nth-of-type(9n + 4),
  > div:nth-of-type(9n + 5),
  > div:nth-of-type(9n + 6),
  > div:nth-of-type(9n + 7),
  > div:nth-of-type(9n + 8) {
    margin: 0 -8px 0 -8px;
    padding: 5px 8px 5px 8px;
  }
  > div:nth-of-type(9n + 9) {
    margin: 0 0 0 -8px;
    padding: 5px 0 5px 8px;
  }
  > div {
    border-bottom: 1px solid rgba(74, 20, 140, 0.15);
  }
`
const Heading = styled.div`
  font-weight: 700;
  position: sticky;
  top: 0;
  background-color: white;
  border-bottom: 1px solid rgba(74, 20, 140, 0.1);
  z-index: 5;
`
const RevertHeading = styled.div`
  font-weight: 700;
  position: sticky;
  top: 0;
  background-color: white;
  border-bottom: 1px solid rgba(74, 20, 140, 0.1);
  z-index: 5;
`
const CloseIcon = styled(IconButton)`
  margin-right: 5px !important;
`

const QueuedUpdatesComponent = (): React.FC => {
  const store: IStoreSnapshotOut = useContext(StoreContext)
  const { session, sessionCounter } = store

  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Erfassen: Warteschlange'
  }, [])

  const rawQueuedUpdates =
    useLiveQuery(
      async (): QueuedUpdate[] =>
        await dexie.queued_updates.orderBy('time').reverse().toArray(),
    ) ?? []

  const queuedUpdates = rawQueuedUpdates.filter((q) => tables.includes(q.table))

  const onClickCloseIcon = useCallback(() => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/', { replace: true })
    }
  }, [navigate])
  const openDocs = useCallback(() => {
    // TODO: better docs for this
    const url = `${constants?.getAppUri()}/docs/data-synchronization`
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return window.open(url, '_blank', 'toolbar=no')
    }
    window.open(url)
  }, [])

  const [pureData, setPureData] = useState(true)
  const onClickPureData = useCallback(() => setPureData(!pureData), [pureData])

  if (!session || sessionCounter === 0) return <Login />

  return (
    <Container>
      <TitleRow>
        <Title>Ausstehende Operationen:</Title>
        <div>
          <IconButton
            aria-label="Anleitung öffnen"
            title="Anleitung öffnen"
            onClick={openDocs}
            size="large"
          >
            <IoMdInformationCircleOutline />
          </IconButton>
          <Button
            title={
              pureData
                ? 'Metadaten für Versionierung und Dokumentation einblenden'
                : 'Metadaten für Versionierung und Dokumentation ausblenden'
            }
            onClick={onClickPureData}
          >
            {pureData
              ? 'Vollständige Daten anzeigen'
              : 'Nur die Daten selbst anzeigen'}
          </Button>
          <CloseIcon
            title="schliessen"
            aria-label="schliessen"
            onClick={onClickCloseIcon}
          >
            <FaTimes />
          </CloseIcon>
        </div>
      </TitleRow>
      {queuedUpdates.length === 0 ? (
        <NoOpsContainer>
          Alle Ihre Änderungen wurden erfolgreich zum Server übertragen.
          <br /> Daher gibt es keine ausstehenden Operationen.
        </NoOpsContainer>
      ) : (
        <OuterContainer>
          <QueriesContainer>
            <Heading>Zeit</Heading>
            <Heading>Projekt</Heading>
            <Heading>Interne Tabelle</Heading>
            <Heading>Tabelle</Heading>
            <Heading>ID</Heading>
            <Heading>Operation</Heading>
            <Heading>Wert vorher</Heading>
            <Heading>Wert nachher</Heading>
            <RevertHeading>widerrufen</RevertHeading>
            {queuedUpdates.map((qu) => (
              <QueuedUpdateComponent key={qu.id} qu={qu} pureData={pureData} />
            ))}
          </QueriesContainer>
        </OuterContainer>
      )}
    </Container>
  )
}

export default observer(QueuedUpdatesComponent)
