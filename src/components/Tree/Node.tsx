import { useContext, useCallback } from 'react'
import {
  MdChevronRight as ChevronRightIcon,
  MdExpandMore as ExpandMoreIcon,
} from 'react-icons/md'
import IconButton from '@mui/material/IconButton'
import styled from 'styled-components'
import isUuid from 'is-uuid'
import last from 'lodash/last'
import isEqual from 'lodash/isEqual'
import { useNavigate } from 'react-router-dom'
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  const navigate = useNavigate()

  const store = useContext(storeContext)
  const { activeNodeArray, editingProjects, setProjectEditing, addOpenNode } =
    store
  const editing = editingProjects.get(data.id)?.editing ?? false
  const isInActiveNodeArray = isEqual(
    activeNodeArray.slice(0, data.activeNodeArray.length),
    data.activeNodeArray.slice(),
  )
  const isActive = data.id === last(activeNodeArray.filter((e) => isUuid.v1(e)))

  const userMayEditStructure: boolean = useLiveQuery(async () => {
    const projectUser = await dexie.project_users.get({
      project_id: data.id,
      user_email: session?.user?.email,
    })

    return projectUser?.role === 'project_manager'
  }, [session?.user?.email])

  const onClickIndent = useCallback(() => {
    addOpenNode(data.activeNodeArray)
    navigate(`/${data.activeNodeArray.join('/')}`)
  }, [addOpenNode, data.activeNodeArray, navigate])

  const onClickProjectEdit = useCallback(
    async () =>
      setProjectEditing({
        id: data.id,
        editing: !editing,
      }),
    [data.id, editing, setProjectEditing],
  )
  const onClickToggle = useCallback(() => {
    // TODO: adjust openNodes
    handlers.toggle()
    if (state.isOpen) {
      removeOpenNodeWithChildren(data.activeNodeArray)
    } else {
      addOpenNode(data.activeNodeArray)
    }
  }, [addOpenNode, data.activeNodeArray, handlers, state.isOpen])

  const projectEditLabel = editing
    ? `Projekt-Struktur für "${data.label}" nicht bearbeiten`
    : `Projekt-Struktur für "${data.label}" bearbeiten`

  // if node is project and user is manager, show structure editing IconButton
  const showProjectEditIcon = userMayEditStructure && data.type === 'project'

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
          onClick={onClickToggle}
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
