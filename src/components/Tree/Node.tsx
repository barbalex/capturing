import { useContext, useCallback } from 'react'
import {
  MdChevronRight as ChevronRightIcon,
  MdExpandMore as ExpandMoreIcon,
} from 'react-icons/md'
import IconButton from '@mui/material/IconButton'
import styled from 'styled-components'
import isEqual from 'lodash/isEqual'
import { useNavigate, useParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'
import { orange } from '@mui/material/colors'

import storeContext from '../../storeContext'
import EditIcon from '../../images/icons/edit_project'
import { dexie } from '../../dexieClient'

const Container = styled.div``
const Indent = styled.div`
  display: flex;
  align-items: center;
  font-weight: ${(props) =>
    props['data-inactivenodearray'] ? 'bold' : 'normal'};
  ${(props) => props['data-active'] && 'color: red;'}
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
  color: rgba(0, 0, 0, 0.8) !important;
`
const ProjectEditIconButton = styled(IconButton)`
  svg {
    height: 18px !important;
    width: 18px !important;
  }
`

const Node = ({ node, style, tree, dragHandle }) => {
  const { rowId } = useParams()
  const navigate = useNavigate()
  const data = node.data
  console.log('Node', { node, style, data, tree, dragHandle, rowId })

  const store = useContext(storeContext)
  const {
    activeNodeArray: aNARaw,
    setActiveNodeArray,
    editingProjects,
    setProjectEditing,
    addNode,
    removeNodeWithChildren,
    session,
  } = store
  const activeNodeArray = aNARaw.slice()
  const isInActiveNodeArray = isEqual(
    activeNodeArray.slice(0, data.activeNodeArray.length),
    data.activeNodeArray,
  )
  let isActive = isEqual(data.activeNodeArray, activeNodeArray.slice())
  const editing = editingProjects.get(data.object.project_id)?.editing
  // when not editing, other nodes in activeNodeArray may be active:
  if (
    data.type === 'project' &&
    !editingProjects.get(data.id)?.editing &&
    isInActiveNodeArray &&
    activeNodeArray.length < 4
  ) {
    isActive = true
  }
  if (
    data.type === 'table' &&
    !editing &&
    isInActiveNodeArray &&
    activeNodeArray.length === 5
  ) {
    isActive = true
  }

  // console.log('Node', {
  //   data,
  //   editing,
  // })

  const userMayEditStructure: boolean = useLiveQuery(async () => {
    const projectUser = await dexie.project_users.get({
      project_id: data.id,
      user_email: session?.user?.email,
    })

    return ['account_manager', 'project_manager'].includes(projectUser?.role)
  }, [session?.user?.email])

  const onClickIndent = useCallback(async () => {
    console.log({
      data,
      isActive,
      activeNodeArray: activeNodeArray.slice(),
      isInActiveNodeArray,
      editing,
    })
    if (
      data.type === 'project' &&
      !editingProjects.get(data.id)?.editing &&
      isActive
    ) {
      // if exists only one standard table, go directly to it's rows
      const tables = await dexie.ttables
        .where({
          deleted: 0,
          project_id: data.id,
          type: 'standard',
        })
        .toArray()
      if (tables.length === 1) {
        addNode(data.activeNodeArray)
        addNode([...data.activeNodeArray, 'tables'])
        addNode([...data.activeNodeArray, 'tables', tables[0]?.id])
        addNode([...data.activeNodeArray, 'tables', tables[0]?.id, 'rows'])
        setActiveNodeArray([
          ...data.activeNodeArray,
          'tables',
          tables[0]?.id,
          'rows',
        ])
        navigate(
          `/${[...data.activeNodeArray, 'tables', tables[0]?.id, 'rows'].join(
            '/',
          )}`,
        )
        return
      }
    }
    if (data.type === 'table' && !editing && !rowId) {
      // if editing data leave out table (nothing to edit)
      const newANA = [...data.activeNodeArray, 'rows']
      addNode(data.activeNodeArray)
      addNode(newANA)
      navigate(`/${newANA.join('/')}`)
      return
    }
    addNode(data.activeNodeArray)
    navigate(`/${data.activeNodeArray.join('/')}`)
  }, [
    data.type,
    data.id,
    data.object.project_id,
    data.activeNodeArray,
    editingProjects,
    isActive,
    addNode,
    navigate,
    setActiveNodeArray,
  ])

  const onClickProjectEdit = useCallback(
    async (e) => {
      // console.log('Node, onClickProjectEdit')
      e.stopPropagation()
      setProjectEditing({
        id: data.id,
        editing: !editingProjects.get(data.id)?.editing,
      })
    },
    [data.id, editingProjects, setProjectEditing],
  )
  const onClickToggle = useCallback(
    (e) => {
      e.stopPropagation()
      // adjust nodes
      node.toggle(e)
      // console.log('Node, onClickToggle', { state, data })
      if (node.isOpen) {
        removeNodeWithChildren(data.activeNodeArray)
      } else {
        // TODO: add this nodes folders?
        addNode(data.activeNodeArray)
      }
    },
    [addNode, data.activeNodeArray, node, removeNodeWithChildren],
  )

  // if node is project and user is manager, show structure editing IconButton
  const showProjectEditIcon = userMayEditStructure && data.type === 'project'
  const projectEditLabel = editingProjects.get(data.id)?.editing
    ? `Projekt-Struktur für "${data.label}" nicht bearbeiten`
    : `Projekt-Struktur für "${data.label}" bearbeiten`

  return (
    <Container style={style} ref={dragHandle}>
      <Indent
        data-inactivenodearray={isInActiveNodeArray}
        isSelected={node.isSelected}
        data-active={isActive}
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
          ) : node.isOpen ? (
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
            <EditIcon
              fill={
                editingProjects.get(data.id)?.editing
                  ? orange[900]
                  : 'rgba(0, 0, 0, 0.8)'
              }
            />
          </ProjectEditIconButton>
        )}
      </Indent>
    </Container>
  )
}

export default observer(Node)
