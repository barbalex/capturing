import { useContext, useCallback } from 'react'
import {
  MdChevronRight as ChevronRightIcon,
  MdExpandMore as ExpandMoreIcon,
} from 'react-icons/md'
import IconButton from '@mui/material/IconButton'
import styled from 'styled-components'
import isUuid from 'is-uuid'
import last from 'lodash/last'
import { useNavigate, useParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'
import { Session } from '@supabase/supabase-js'
import { orange } from '@mui/material/colors'

import storeContext from '../../storeContext'
import EditIcon from '../../images/icons/edit_project'
import { supabase } from '../../supabaseClient'
import { dexie } from '../../dexieClient'

const Container = styled.div``
const Indent = styled.div`
  display: flex;
  align-items: center;
  font-weight: ${(props) => (props.isInActiveNodeArray ? 'bold' : 'normal')};
  ${(props) => props.isActive && 'color: red;'}
`
const Label = styled.div`
  font-size: 1em;
  flex-grow: 1;
  padding-left: 5px;
  &:hover {
    background-color: rgba(74, 20, 140, 0.05);
    cursor: pointer;
  }
`
const NoChildren = styled.div`
  width: 18px;
  color: rgba(0, 0, 0, 0.54) !important;
`
const ProjectEditIconButton = styled(IconButton)`
  svg {
    height: 18px !important;
    width: 18px !important;
  }
`

const Node = ({ innerRef, data, styles, handlers, state, tree }) => {
  const session: Session = supabase.auth.session()
  const { projectId } = useParams()
  const navigate = useNavigate()

  const store = useContext(storeContext)
  const { activeNodeArray, editingProjects, setProjectEditing } = store
  const editing = editingProjects.get(projectId)?.editing ?? false
  const isInActiveNodeArray = activeNodeArray.includes(data.id)
  const isActive = data.id === last(activeNodeArray.filter((e) => isUuid.v1(e)))

  const userMayEditStructure: boolean = useLiveQuery(async () => {
    const projectUser = await dexie.project_users.get({
      project_id: projectId,
      user_email: session?.user?.email,
    })

    return projectUser.role === 'project_manager'
  }, [projectId, session?.user?.email])

  const onClickIndent = useCallback(() => {
    navigate(`/${data.activeNodeArray.join('/')}`)
  }, [data, navigate])

  const onClickProjectEdit = useCallback(
    async () =>
      setProjectEditing({
        id: projectId,
        editing: !editing,
      }),
    [editing, projectId, setProjectEditing],
  )

  const projectEditLabel = editing
    ? `Projekt-Struktur für "${data.label}" nicht bearbeiten`
    : `Projekt-Struktur für "${data.label}" bearbeiten`

  /**
   * TODO:
   * if node is project and user is manager, show structure editing IconButton
   */
  const showProjectEditIcon = userMayEditStructure && data.type === 'project'

  console.log({ data, showProjectEditIcon })

  return (
    <Container ref={innerRef} style={styles.row}>
      <Indent
        style={styles.indent}
        isInActiveNodeArray={isInActiveNodeArray}
        isSelected={state.isSelected}
        isActive={isActive}
        onClick={onClickIndent}
      >
        <IconButton
          aria-label="toggle"
          size="small"
          onClick={handlers.toggle}
          disabled={!data.childrenCount}
        >
          {!data.childrenCount ? (
            <NoChildren>-</NoChildren>
          ) : state.isOpen ? (
            <ExpandMoreIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </IconButton>
        <Label>{data.label}</Label>
        {showProjectEditIcon && (
          <ProjectEditIconButton
            aria-label={projectEditLabel}
            title={projectEditLabel}
            onClick={onClickProjectEdit}
            size="small"
          >
            <EditIcon fill={editing ? orange[900] : 'rgba(0, 0, 0, 0.54)'} />
          </ProjectEditIconButton>
        )}
      </Indent>
    </Container>
  )
}

export default observer(Node)
