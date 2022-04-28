import { useCallback } from 'react'
import styled from 'styled-components'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import { FaRegTimesCircle } from 'react-icons/fa'
import { Session } from '@supabase/supabase-js'

import { dexie, ProjectUser } from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'

const StyledListItem = styled(ListItem)`
  padding-left: 8px;
  padding-right: 8px;
  &:hover {
    background-color: rgba(74, 20, 140, 0.03);
  }
  border-color: rgba(74, 20, 140, 0.1);
  user-select: none;
`
const RemoveIcon = styled(FaRegTimesCircle)``

type Props = {
  projectUser: ProjectUser
}

const ProjectUserComponent = ({ projectUser }: Props) => {
  const session: Session = supabase.auth.session()
  const onClickRemove = useCallback(() => {
    projectUser.deleteOnServerAndClient({ session })
  }, [projectUser, session])

  return (
    <StyledListItem
      secondaryAction={
        <IconButton
          title={`${projectUser.email ?? ''} entfernen`}
          onClick={onClickRemove}
          size="medium"
        >
          <RemoveIcon />
        </IconButton>
      }
    >
      <ListItemText>{`${projectUser.user_email} (${projectUser.role})`}</ListItemText>
    </StyledListItem>
  )
}

export default ProjectUserComponent
