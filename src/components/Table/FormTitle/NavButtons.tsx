import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import { FaArrowUp, FaArrowRight, FaArrowLeft } from 'react-icons/fa'
import { Link, useParams, resolvePath } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import styled from 'styled-components'

import StoreContext from '../../../storeContext'
import { dexie } from '../../../dexieClient'
import sortByLabelName from '../../../utils/sortByLabelName'

export const MenuChildrenButton = styled(Button)`
  .MuiButton-endIcon {
    margin-left: 4px;
  }
`

const TableNavButtons = () => {
  const { projectId, tableId } = useParams()
  const store = useContext(StoreContext)
  const { activeNodeArray, removeNode, editingProjects } = store
  const editing = editingProjects.get(projectId)?.editing ?? false

  const data = useLiveQuery(async () => {
    const [tables, project] = await Promise.all([
      dexie.ttables.where({ deleted: 0, project_id: projectId }).toArray(),
      dexie.projects.get(projectId),
    ])

    return {
      tableIds: sortByLabelName({
        objects: tables,
        useLabels: project.use_labels,
      }).map((t) => t.id),
    }
  }, [projectId])
  const tableIds: string[] = data?.tableIds ?? []

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
          endIcon={<FaArrowRight />}
          component={Link}
          to="fields"
        >
          Felder
        </MenuChildrenButton>
      )}
      <MenuChildrenButton endIcon={<FaArrowRight />} component={Link} to="rows">
        Datensätze
      </MenuChildrenButton>
    </>
  )
}

export default observer(TableNavButtons)
