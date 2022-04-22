import { useCallback } from 'react'
import { FaRegTimesCircle } from 'react-icons/fa'
import { MdFileDownload } from 'react-icons/md'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { Session } from '@supabase/supabase-js'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import fileSaver from 'file-saver'

import ErrorBoundary from '../../../shared/ErrorBoundary'
import { dexie, File } from '../../../../dexieClient'
import { supabase } from '../../../../supabaseClient'

const StyledListItem = styled(ListItem)`
  &:first-of-type {
    border-top: 1px solid rgba(74, 20, 140, 0.1);
  }
  &:hover {
    background-color: rgba(74, 20, 140, 0.1);
  }
  border-color: rgba(74, 20, 140, 0.1);
  cursor: pointer;
`
const RemoveIcon = styled(FaRegTimesCircle)`
  color: red;
  font-size: 18px;
`
type Props = {
  file: File
}
const Files = ({ file }: Props) => {
  const session: Session = supabase.auth.session()

  const onClickItem = useCallback(() => {
    console.log('item clicked')
  }, [])

  const onClickRemove = useCallback(
    (e) => {
      e.stopPropagation()
      file.deleteOnServerAndClient({ session })
    },
    [file, session],
  )
  const onClickDownload = useCallback(
    (e) => {
      e.stopPropagation()
      console.log('TODO:')
      fileSaver.saveAs(new Blob([file.file], { type: file.type }), file.name)
    },
    [file.file, file.name, file.type],
  )

  return (
    <ErrorBoundary>
      <StyledListItem divider onClick={onClickItem}>
        <ListItemText primary={file.name} secondary={file.type} />
        <div>
          <IconButton
            title={`${file.name ?? 'Datei'} herunterladen`}
            onClick={onClickDownload}
            size="medium"
          >
            <MdFileDownload />
          </IconButton>
          <IconButton
            title={`${file.name ?? 'Datei'} entfernen`}
            onClick={onClickRemove}
            size="medium"
          >
            <RemoveIcon />
          </IconButton>
        </div>
      </StyledListItem>
    </ErrorBoundary>
  )
}

export default observer(Files)
