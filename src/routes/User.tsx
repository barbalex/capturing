import { useEffect, useContext, useCallback, useState, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { FaExclamationCircle } from 'react-icons/fa'
import { useLiveQuery } from 'dexie-react-hooks'
import styled from 'styled-components'

import StoreContext from '../storeContext'
import Login from '../components/Login'
import constants from '../utils/constants'
import logout from '../utils/logout'
import { supabase } from '../supabaseClient'
import { dexie, QueuedUpdate } from '../dexieClient'
import ErrorBoundary from '../components/shared/ErrorBoundary'

const Container = styled.div`
  min-height: calc(100vh - ${constants.appBarHeight}px);
  position: relative;
`
const RiskyButton = styled(Button)`
  color: #d84315 !important;
  border-color: #d84315 !important;
`

/**
 * Todo: enable editing email
 * then edit it in public.users and auth.users
 */
const UserPage = () => {
  const store = useContext(StoreContext)
  const { online } = store

  const session = supabase.auth.session()
  const user = supabase.auth.user()

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
    logout({ store })
  }, [queuedUpdatesCount, store])

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

  console.log('UserPage rendering', { queuedUpdatesCount, online })

  return (
    <ErrorBoundary>
      <Container>
        User
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
      </Container>
      <Dialog
        open={pendingOperationsDialogOpen}
        onClose={() => setPendingOperationsDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
      >
        <DialogTitle id="alert-dialog-title">Wirklich abmelden?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {`Beim Abmelden werden aus Datenschutzgründen alle lokalen Daten
              entfernt. Es gibt noch ${queuedUpdatesCount} ausstehende
              Operationen. Wenn Sie jetzt abmelden, gehen diese verloren.
              Vermutlich warten Sie besser, bis diese Operationen an den Server
              übermittelt wurden.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPendingOperationsDialogOpen(false)}
            color="primary"
            autoFocus
            variant="outlined"
          >
            Ich bleibe angemeldet, um die ausstehenden Operationen nicht zu
            verlieren
          </Button>
          <RiskyButton
            onClick={() => {
              setPendingOperationsDialogOpen(false)
              logout({ store })
            }}
            variant="outlined"
            startIcon={<FaExclamationCircle />}
          >
            Ich will abmelden, obwohl ich die ausstehenden Operationen verliere
          </RiskyButton>
        </DialogActions>
      </Dialog>
    </ErrorBoundary>
  )
}

export default observer(UserPage)
