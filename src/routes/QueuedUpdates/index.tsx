import { useEffect, useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { FaTimes } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { IoMdInformationCircleOutline } from 'react-icons/io'
import styled from '@emotion/styled'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'

import { dexie, QueuedUpdate } from '../../dexieClient'
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
`
const NoOpsContainer = styled.div`
  padding: 0 15px;
`
const OuterContainer = styled.div`
  height: calc(100vh - ${constants.appBarHeight}px - 15px - 23px - 23px);
  overflow-x: hidden;
  overflow-y: auto;
`
const QueriesContainer = styled.div`
  padding: 0 15px;
  display: grid;
  grid-template-columns: 180px auto auto auto auto auto 100px;
  column-gap: 5px;
  > * {
    position: relative;
  }
  overflow: hidden;
`
const Heading = styled.div`
  font-weight: 700;
`
const RevertHeading = styled.div`
  font-weight: 700;
  justify-self: center;
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

  const queuedUpdates =
    useLiveQuery(
      async (): QueuedUpdate[] =>
        await dexie.queued_updates.orderBy('time').reverse().toArray(),
    ) ?? []

  console.log('QueuedUpdates, queuedUpdates:', queuedUpdates)

  const onClickCloseIcon = useCallback(() => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/', { replace: true })
    }
  }, [navigate])
  const openDocs = useCallback(() => {
    // TODO: better docs for this
    const url = `${constants?.getAppUri()}/docs/data-versioning`
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return window.open(url, '_blank', 'toolbar=no')
    }
    window.open(url)
  }, [])

  // console.log('Projects, session:', { session, sessionCounter })

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
          <CloseIcon
            title="schliessen"
            aria-label="schliessen"
            onClick={onClickCloseIcon}
          >
            <FaTimes />
          </CloseIcon>
        </div>
      </TitleRow>
      <OuterContainer>
        <QueriesContainer>
          <Heading>Zeit</Heading>
          <Heading>Tabelle</Heading>
          <Heading>ID</Heading>
          <Heading>Feld / Operation</Heading>
          <Heading>vorher</Heading>
          <Heading>nachher</Heading>
          <RevertHeading>widerrufen</RevertHeading>
          {queuedUpdates.reverse().map((qq, i) => (
            <QueuedUpdateComponent key={qq.id} qq={qq} index={i} />
          ))}
        </QueriesContainer>
      </OuterContainer>
    </Container>
  )
}

export default observer(QueuedUpdatesComponent)
