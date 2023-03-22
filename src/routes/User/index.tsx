import { useEffect, useContext, useCallback, useState, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import Button from '@mui/material/Button'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import styled from '@emotion/styled'

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
import { IStore } from '../../store'

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
const AccordionP = styled.p`
  margin: 8px 0;
`

/**
 * TODO: enable editing email
 * then edit it in public.users and auth.users
 * TODO: enhance resetting
 * 1. do it without reloading and navigating
 * 2. enable resetting settings while keeping them when resetting data
 */
const UserPage = () => {
  const store: IStore = useContext(StoreContext)
  const { online, session } = store

  const user = session?.user

  const navigate = useNavigate()

  // console.log('Projects, mapInitiated:', mapInitiated)

  useEffect(() => {
    document.title = 'Erfassen: Benutzer'
  }, [])

  const [pendingOperationsDialogOpen, setPendingOperationsDialogOpen] =
    useState<boolean>(false)
  const queuedUpdatesCount =
    useLiveQuery(async () => await dexie.queued_updates.count(), []) ?? 0

  const onClickLogout = useCallback(() => {
    if (queuedUpdatesCount) return setPendingOperationsDialogOpen(true)
    logout({ store, navigate })
  }, [navigate, queuedUpdatesCount, store])

  const [purgeDialogOpen, setPurgeDialogOpen] = useState<boolean>(false)
  const onClickPurge = useCallback(async () => {
    if (queuedUpdatesCount) return setPurgeDialogOpen(true)
    await dexie.delete()
    navigate('/')
    window.location.reload(true)
  }, [navigate, queuedUpdatesCount])

  const email = useMemo(() => user?.email ?? {}, [user?.email])

  const [resetTitle, setResetTitle] = useState<string>('Passwort zurücksetzen')
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

  /**
   * TODO:
   * add email and method to change it
   */

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
        <Accordion summary="I care about my personal data 🤫">
          <AccordionP>We don&apos;t want it!</AccordionP>
          <AccordionP>
            Only your email is needed to recognize and authenticate you.
          </AccordionP>
        </Accordion>
        <Accordion summary="Who needs subscriptions? 👥">
          <AccordionP>Whoever creates a project (its owner).</AccordionP>
          <AccordionP>
            Additional collaborators, whose emails the owner lists as project
            users, do <strong>not</strong> need a subscription.
          </AccordionP>
          <AccordionP>
            Collaborators only need to register with their email. Then all
            projects in which they participate are synced to their app.
          </AccordionP>
          <AccordionP>
            You can simultaneously own projects and collaborate in others.
          </AccordionP>
        </Accordion>
        <Accordion summary="What subscriptions exist? 🛒">
          <AccordionP>
            Use the <strong>free 30 day</strong> subscription for testing.
          </AccordionP>
          <AccordionP>
            After it expires, you need a payed subscription to configure own
            projects and keep them editable.
          </AccordionP>
          <AccordionP>
            We haven&apos;t decided on payed subscriptions yet.
          </AccordionP>
        </Accordion>
        <Accordion summary="What if a subscription expires? 🤔">
          <AccordionP>
            It is no more possible to configure projects and edit data 👀.
          </AccordionP>
          <AccordionP>
            You will still be able to read and export it though 😮‍💨.
          </AccordionP>
          <AccordionP>
            Three months after expiration projects are removed from our live
            servers 😟.
          </AccordionP>
          <AccordionP>
            Backups exist and your data will remain in your app. But as we pay
            our bills with subscriptions, we won&apos;t feel responsible for
            your data any more 🤷.
          </AccordionP>
          <AccordionP>
            Of course we will send you an email beforehand - we&apos;d love too
            keep you ❤️.
          </AccordionP>
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
