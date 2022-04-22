import { useCallback } from 'react'
import { FaRegTimesCircle } from 'react-icons/fa'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import SparkMD5 from 'spark-md5'
import { Session } from '@supabase/supabase-js'
import { useLiveQuery } from 'dexie-react-hooks'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

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

  return (
    <ErrorBoundary>
      <StyledListItem
        divider
        onClick={onClickItem}
        secondaryAction={
          <IconButton
            title={`${file.name ?? 'Datei'} entfernen`}
            onClick={onClickRemove}
            size="medium"
          >
            <RemoveIcon />
          </IconButton>
        }
      >
        <ListItemText primary={file.name} secondary={file.type} />
      </StyledListItem>
    </ErrorBoundary>
  )
}

export default observer(Files)
