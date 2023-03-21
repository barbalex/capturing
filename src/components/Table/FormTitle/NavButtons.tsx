import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import {
  FaArrowUp,
  FaArrowRight,
  FaArrowLeft,
  FaArrowDown,
} from 'react-icons/fa'
import { Link, useParams, resolvePath } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import styled from '@emotion/styled'

import StoreContext from '../../../storeContext'
import { dexie, Table, Project } from '../../../dexieClient'
import sortByLabelName from '../../../utils/sortByLabelName'
import { IStore } from '../../../store'

export const MenuChildrenButton = styled(Button)`
  font-size: 0.75rem;
  .MuiButton-endIcon {
    margin-left: 4px;
  }
`
const StyledFaArrowDown = styled(FaArrowDown)`
  font-size: 1.75rem !important;
`

const TableNavButtons = () => {
  const { projectId, tableId } = useParams()
  const store: IStore = useContext(StoreContext)
  const { activeNodeArray, removeNode, editingProjects, setHorizontalNavIds } =
    store
  const editing = editingProjects.get(projectId)?.editing ?? false

  const data = useLiveQuery(async () => {
    const [tables, project]: [Table[], Project] = await Promise.all([
      dexie.ttables.where({ deleted: 0, project_id: projectId }).toArray(),
      dexie.projects.get(projectId),
    ])
    const ids = sortByLabelName({
      objects: tables,
      useLabels: project.use_labels,
    }).map((t) => t.id)
    setHorizontalNavIds(ids)

    return {
      tableIds: ids,
    }
  }, [projectId])
  const tableIds = data?.tableIds ?? []

  const parentPath = resolvePath(`..`, window.location.pathname)?.pathname
  const activeIndex = tableIds.indexOf(tableId)
  const previousId = activeIndex > 0 ? tableIds[activeIndex - 1] : activeIndex
  const previousPath = `${parentPath}/${previousId}`
  const nextId =
    activeIndex === tableIds.length - 1
      ? tableIds[activeIndex]
      : tableIds[activeIndex + 1]
  const nextPath = `${parentPath}/${nextId}`

  const onClickUp = useCallback(() => {
    removeNode(activeNodeArray)
  }, [activeNodeArray, removeNode])

  return (
    <>
      <IconButton
        title="Zur Liste"
        component={Link}
        to={parentPath}
        onClick={onClickUp}
        size="large"
      >
        <FaArrowUp />
      </IconButton>
      <IconButton
        title="Zur vorigen"
        component={Link}
        to={previousPath}
        size="large"
        disabled={activeIndex === 0}
      >
        <FaArrowLeft />
      </IconButton>
      <IconButton
        title="Zur nächsten"
        component={Link}
        to={nextPath}
        size="large"
        disabled={activeIndex === tableIds.length - 1}
      >
        <FaArrowRight />
      </IconButton>
      {!!editing && (
        <MenuChildrenButton
          endIcon={<StyledFaArrowDown />}
          component={Link}
          to="fields"
        >
          Felder
        </MenuChildrenButton>
      )}
      <MenuChildrenButton
        endIcon={<StyledFaArrowDown />}
        component={Link}
        to="rows"
      >
        Datensätze
      </MenuChildrenButton>
    </>
  )
}

export default observer(TableNavButtons)
