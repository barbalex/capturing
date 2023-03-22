import { useContext } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import { FaExclamationCircle } from 'react-icons/fa'
import styled from '@emotion/styled'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

import logout from '../../utils/logout'
import StoreContext from '../../storeContext'
import { IStore } from '../../store'

const RiskyButton = styled(Button)`
  color: #d84315 !important;
  border-color: #d84315 !important;
`

interface Props {
  pendingOperationsDialogOpen: boolean
  setPendingOperationsDialogOpen: (value: boolean) => void
  queuedUpdatesCount: number
}

const PendingOperationsDialog = ({
  pendingOperationsDialogOpen,
  setPendingOperationsDialogOpen,
  queuedUpdatesCount,
}) => {
  const navigate = useNavigate()
  const store: IStore = useContext(StoreContext)

  return (
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
          Ich bleibe angemeldet, um keine Daten zu verlieren
        </Button>
        <RiskyButton
          onClick={() => {
            setPendingOperationsDialogOpen(false)
            logout({ store, navigate })
          }}
          variant="outlined"
          startIcon={<FaExclamationCircle />}
        >
          Ich will abmelden, obwohl ich Daten verliere
        </RiskyButton>
      </DialogActions>
    </Dialog>
  )
}

export default observer(PendingOperationsDialog)
