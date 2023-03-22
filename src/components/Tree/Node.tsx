import { useContext, useCallback } from 'react'
import {
  MdChevronRight as ClosedWithChildrenIcon,
  MdExpandMore as OpenWithChildrenIcon,
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
import { dexie, Table } from '../../dexieClient'
import isNodeOpen from './isNodeOpen'
import toggleNodeSymbol from './toggleNodeSymbol'
import { IStoreSnapshotOut } from '../../store'
import { TreeNode } from './Viewing'

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

interface Props {
  node: TreeNode
}

const Node = ({ node }: Props): React.FC => {
  const { rowId } = useParams()
  const navigate = useNavigate()
  const { search } = useLocation()

  const store: IStoreSnapshotOut = useContext(storeContext)
  const {
    activeNodeArray: aNARaw,
    setActiveNodeArray,
    editingProjects,
    setProjectEditing,
    addNode,
    session,
    nodes,
  } = store
  const activeNodeArray: string[] = aNARaw.slice()
  const isInActiveNodeArray = isEqual(
    activeNodeArray.slice(0, node.url.length),
    node.url,
  )
  let isActive = isEqual(node.url, activeNodeArray.slice())
  const editing: boolean | undefined = editingProjects.get(
    node.projectId,
  )?.editing
  // when not editing, other nodes in activeNodeArray may be active:
  if (
    node.type === 'project' &&
    !editing &&
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

  const userMayEditStructure = useLiveQuery(async () => {
    const projectUser = await dexie.project_users.get({
      project_id: node.id,
      user_email: session?.user?.email,
    })

    return ['account_manager', 'project_manager'].includes(projectUser?.role)
  }, [session?.user?.email])

  const onClickIndent = useCallback(async () => {
    if (node.type === 'project' && !editing && isActive) {
      // if exists only one standard table, go directly to it's rows
      const tables: Table[] = await dexie.ttables
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
  }, [node, isActive, editing, rowId, addNode, navigate, setActiveNodeArray])

  const onClickProjectEdit = useCallback(
    async (e: React.MouseEvent) => {
      // stop propagation to prevent onClickIndent
      e.stopPropagation()
      setProjectEditing({
        id: node.id,
        editing: !editing,
      })
    },
    [setProjectEditing, node.id, editing],
  )
  const isOpen = isNodeOpen({ nodes, url: node.url })

  // console.log('Node', { isOpen, node })

  const onClickToggle = useCallback(
    (event: React.MouseEvent) => {
      toggleNodeSymbol({ node, store, search, navigate })
      // stop propagation to prevent onClickIndent
      event.stopPropagation()
    },
    [navigate, node, search, store],
  )

  // if node is project and user is manager, show structure editing IconButton
  const showProjectEditIcon = userMayEditStructure && node.type === 'project'
  const projectEditLabel = editing
    ? `Projekt-Struktur für "${node.label}" nicht bearbeiten`
    : `Projekt-Struktur für "${node.label}" bearbeiten`

  const level = editing
    ? node.url.length - 2
    : node.url.length > 8
    ? node.url.length - 6
    : node.url.length > 6
    ? node.url.length - 5
    : node.url.length > 4
    ? node.url.length - 4
    : node.url.length > 2
    ? node.url.length - 3
    : node.url.length - 2

  return (
    <Container
      // need id to scroll elements into view
      id={node.id}
    >
      <Indent
        data-inactivenodearray={isInActiveNodeArray}
        isSelected={isInActiveNodeArray}
        data-active={isActive}
        onClick={onClickIndent}
        data-level={level}
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
            <OpenWithChildrenIcon />
          ) : (
            <ClosedWithChildrenIcon />
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
