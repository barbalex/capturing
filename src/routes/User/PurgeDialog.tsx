import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import { FaExclamationCircle } from 'react-icons/fa'
import styled from '@emotion/styled'
import { useNavigate } from 'react-router-dom'

import { dexie } from '../../dexieClient'

const RiskyButton = styled(Button)`
  color: #d84315 !important;
  border-color: #d84315 !important;
`

interface Props {
  purgeDialogOpen: boolean
  setPurgeDialogOpen: (value: boolean) => void
  queuedUpdatesCount: number
}

const PurgeDialog = ({
  purgeDialogOpen,
  setPurgeDialogOpen,
  queuedUpdatesCount,
}: Props) => {
  const navigate = useNavigate()

  return (
    <Dialog
      open={purgeDialogOpen}
      onClose={() => setPurgeDialogOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="md"
    >
      <DialogTitle id="alert-dialog-title">Wirklich löschen?</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {`Es gibt noch ${queuedUpdatesCount} ausstehende
          Operationen, die noch nicht an den Server übermittelt werden konnten. Wenn Sie die Daten auf diesem Gerät löschen, gehen sie verloren.
          Vermutlich warten Sie besser, bis diese Operationen an den Server
          übermittelt wurden.`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setPurgeDialogOpen(false)}
          color="primary"
          autoFocus
          variant="outlined"
        >
          Ich verzichte, um keine Daten zu verlieren
        </Button>
        <RiskyButton
          onClick={async () => {
            setPurgeDialogOpen(false)
            await dexie.delete()
            navigate('/')
            window.location.reload(true)
          }}
          variant="outlined"
          startIcon={<FaExclamationCircle />}
        >
          Ich will alle Daten auf diesem Gerät löschen, obwohl ich Daten
          verliere
        </RiskyButton>
      </DialogActions>
    </Dialog>
  )
}

export default PurgeDialog
