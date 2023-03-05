import { useContext, useCallback, useMemo } from 'react'
import {
  MdChevronRight as ChevronRightIcon,
  MdExpandMore as ExpandMoreIcon,
} from 'react-icons/md'
import IconButton from '@mui/material/IconButton'
import styled from '@emotion/styled'
import isEqual from 'lodash/isEqual'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'
import { orange } from '@mui/material/colors'

import storeContext from '../../storeContext'
import EditIcon from '../../images/icons/edit_project'
import { dexie } from '../../dexieClient'
import isNodeOpen from './isNodeOpen'
import toggleNodeSymbol from './toggleNodeSymbol'

const Container = styled.div``
const Indent = styled.div`
  display: flex;
  align-items: center;
  font-weight: ${(props) =>
    props['data-inactivenodearray'] ? 'bold' : 'normal'};
  ${(props) => props['data-active'] && 'color: red;'}
  margin-left: ${(props) => `${props['data-level'] * 28}px`};
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

// tree is passed in but not used
const Node = ({ node }) => {
  const { rowId } = useParams()
  const navigate = useNavigate()
  const { search } = useLocation()
  // console.log('Node', getSnapshot(nodes))

  const store = useContext(storeContext)
  const {
    activeNodeArray: aNARaw,
    setActiveNodeArray,
    editingProjects,
    setProjectEditing,
    addNode,
    removeNodeWithChildren,
    session,
    nodes,
  } = store
  const activeNodeArray = aNARaw.slice()
  const isInActiveNodeArray = isEqual(
    activeNodeArray.slice(0, node.url.length),
    node.url,
  )
  let isActive = isEqual(node.url, activeNodeArray.slice())
  const editing = editingProjects.get(node.object.project_id)?.editing
  // when not editing, other nodes in activeNodeArray may be active:
  if (
    node.type === 'project' &&
    !editingProjects.get(node.id)?.editing &&
    isInActiveNodeArray &&
    activeNodeArray.length < 4
  ) {
    isActive = true
  }
  if (
    node.type === 'table' &&
    !editing &&
    isInActiveNodeArray &&
    activeNodeArray.length === 5
  ) {
    isActive = true
  }

  // console.log('Node', {
  //   node,
  //   editing,
  // })

  const userMayEditStructure: boolean = useLiveQuery(async () => {
    const projectUser = await dexie.project_users.get({
      project_id: node.id,
      user_email: session?.user?.email,
    })

    return ['account_manager', 'project_manager'].includes(projectUser?.role)
  }, [session?.user?.email])

  const onClickIndent = useCallback(async () => {
    // console.log('Node, onClickIndent', {
    //   node,
    //   isActive,
    //   activeNodeArray: activeNodeArray.slice(),
    //   isInActiveNodeArray,
    //   editing,
    // })
    if (
      node.type === 'project' &&
      !editingProjects.get(node.id)?.editing &&
      isActive
    ) {
      // if exists only one standard table, go directly to it's rows
      const tables = await dexie.ttables
        .where({
          deleted: 0,
          project_id: node.id,
          type: 'standard',
        })
        .toArray()
      if (tables.length === 1) {
        addNode(node.url)
        addNode([...node.url, 'tables'])
        addNode([...node.url, 'tables', tables[0]?.id])
        addNode([...node.url, 'tables', tables[0]?.id, 'rows'])
        setActiveNodeArray([...node.url, 'tables', tables[0]?.id, 'rows'])
        navigate(`/${[...node.url, 'tables', tables[0]?.id, 'rows'].join('/')}`)
        return
      }
    }
    if (node.type === 'table' && !editing && !rowId) {
      // if editing node leave out table (nothing to edit)
      const newANA = [...node.url, 'rows']
      addNode(node.url)
      addNode(newANA)
      navigate(`/${newANA.join('/')}`)
      return
    }
    addNode(node.url)
    navigate(`/${node.url.join('/')}`)
  }, [
    node,
    isActive,
    editing,
    editingProjects,
    rowId,
    addNode,
    navigate,
    setActiveNodeArray,
  ])

  const onClickProjectEdit = useCallback(
    async (e) => {
      // stop propagation to prevent onClickIndent
      e.stopPropagation()
      setProjectEditing({
        id: node.id,
        editing: !editingProjects.get(node.id)?.editing,
      })
    },
    [node.id, editingProjects, setProjectEditing],
  )
  const isOpen = isNodeOpen({ nodes, url: node.url })

  // console.log('Node', { isOpen, node })

  const onClickToggle = useCallback(
    (event) => {
      toggleNodeSymbol({ node, store, search, navigate })
      // stop propagation to prevent onClickIndent
      event.stopPropagation()
    },
    [navigate, node, search, store],
  )

  // if node is project and user is manager, show structure editing IconButton
  const showProjectEditIcon = userMayEditStructure && node.type === 'project'
  const projectEditLabel = editingProjects.get(node.id)?.editing
    ? `Projekt-Struktur für "${node.label}" nicht bearbeiten`
    : `Projekt-Struktur für "${node.label}" bearbeiten`

  return (
    <Container
      // need this id to scroll elements into view
      id={node.id}
    >
      <Indent
        data-inactivenodearray={isInActiveNodeArray}
        isSelected={isInActiveNodeArray}
        data-active={isActive}
        onClick={onClickIndent}
        data-level={node.url.length - 2}
      >
        <IconButton
          aria-label="toggle"
          size="small"
          onClick={onClickToggle}
          disabled={!node.childrenCount}
        >
          {!node.childrenCount ? (
            <NoChildren>-</NoChildren>
          ) : isOpen ? (
            <ExpandMoreIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </IconButton>
        <Label>{node.label}</Label>
        {showProjectEditIcon && (
          <ProjectEditIconButton
            aria-label={projectEditLabel}
            title={projectEditLabel}
            onClick={onClickProjectEdit}
            size="small"
          >
            <EditIcon
              fill={
                editingProjects.get(node.id)?.editing
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
