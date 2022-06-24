import { useEffect, useContext, useCallback, useState, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import Button from '@mui/material/Button'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import StoreContext from '../../storeContext'
import Login from '../../components/Login'
import constants from '../../utils/constants'
import logout from '../../utils/logout'
import { supabase } from '../../supabaseClient'
import { dexie } from '../../dexieClient'
import ErrorBoundary from '../../components/shared/ErrorBoundary'
import Accordion from '../../components/shared/Accordion'
import PendingOperationsDialog from './PendingOperationsDialog'
import PurgeDialog from './PurgeDialog'

const Container = styled.div`
  min-height: calc(100vh - ${constants.appBarHeight}px);
  position: relative;
  padding: 10px;
`
const ButtonsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`
const AccordionText = styled.p`
  margin: 4px 0;
`

/**
 * TODO: enable editing email
 * then edit it in public.users and auth.users
 * TODO: enhance resetting
 * 1. do it without reloading and navigating
 * 2. enable resetting settings while keeping them when resetting data
 */
const UserPage = () => {
  const store = useContext(StoreContext)
  const { online } = store

  const session = supabase.auth.session()
  const user = supabase.auth.user()

  const navigate = useNavigate()

  // console.log('Projects, mapInitiated:', mapInitiated)

  useEffect(() => {
    document.title = 'Erfassen: Benutzer'
  }, [])
  const [pendingOperationsDialogOpen, setPendingOperationsDialogOpen] =
    useState(false)
  const queuedUpdatesCount =
    useLiveQuery(async () => await dexie.queued_updates.count(), []) ?? 0

  const onClickLogout = useCallback(() => {
    if (queuedUpdatesCount) return setPendingOperationsDialogOpen(true)
    logout({ store, navigate })
  }, [navigate, queuedUpdatesCount, store])

  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false)
  const onClickPurge = useCallback(async () => {
    if (queuedUpdatesCount) return setPurgeDialogOpen(true)
    await dexie.delete()
    navigate('/')
    window.location.reload(true)
  }, [navigate, queuedUpdatesCount])

  const email = useMemo(() => user?.email ?? {}, [user?.email])

  const [resetTitle, setResetTitle] = useState('Passwort zurücksetzen')
  const onClickResetPassword = useCallback(async () => {
    setResetTitle('...')
    const { error } = await supabase.auth.api.resetPasswordForEmail(email)
    if (error) {
      setResetTitle('Fehler: Passwort nicht zurückgesetzt')
      setTimeout(() => {
        setResetTitle('Passwort zurücksetzen')
        setAnchorEl(null)
      }, 5000)
    }

    setResetTitle('Email ist unterwegs!')
    setTimeout(() => {
      setResetTitle('Passwort zurücksetzen')
      setAnchorEl(null)
    }, 5000)
  }, [email])

  if (!session) return <Login />

  // console.log('UserPage rendering', { queuedUpdatesCount, online })

  return (
    <ErrorBoundary>
      <Container>
        User
        <ButtonsColumn>
          {online && (
            <>
              <Button onClick={onClickLogout} variant="outlined">
                abmelden
              </Button>
              <Button onClick={onClickResetPassword} variant="outlined">
                {resetTitle}
              </Button>
            </>
          )}
          <Button onClick={onClickPurge} variant="outlined">
            Alle Daten auf diesem Gerät löschen und neu vom Server laden
          </Button>
        </ButtonsColumn>
        <Accordion summary="I care about my personal data 😟">
          <AccordionText>We don&apos;t want it!</AccordionText>
          <AccordionText>
            Only your email is needed to recognize and authenticate you.
          </AccordionText>
        </Accordion>
      </Container>
      <PendingOperationsDialog
        pendingOperationsDialogOpen={pendingOperationsDialogOpen}
        setPendingOperationsDialogOpen={setPendingOperationsDialogOpen}
        queuedUpdatesCount={queuedUpdatesCount}
      />
      <PurgeDialog
        purgeDialogOpen={purgeDialogOpen}
        setPurgeDialogOpen={setPurgeDialogOpen}
        queuedUpdatesCount={queuedUpdatesCount}
      />
    </ErrorBoundary>
  )
}

export default observer(UserPage)
