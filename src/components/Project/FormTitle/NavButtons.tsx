import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import {
  FaArrowUp,
  FaArrowLeft,
  FaArrowRight,
  FaArrowDown,
} from 'react-icons/fa'
import { Link, resolvePath, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import styled from '@emotion/styled'

import StoreContext from '../../../storeContext'
import { MenuChildrenButton } from '../../Table/FormTitle/NavButtons'
import { dexie } from '../../../dexieClient'
import { IStore } from '../../../store'
import sortProjectsByLabelName from '../../../utils/sortProjectsByLabelName'

const StyledFaArrowDown = styled(FaArrowDown)`
  font-size: 1.75rem !important;
`

const ProjectNavButtons = () => {
  const { projectId } = useParams()

  const store: IStore = useContext(StoreContext)
  const { activeNodeArray, removeNode, setHorizontalNavIds, editingProjects } =
    store
  const editing = editingProjects.get(projectId)?.editing ?? false

  const result = useLiveQuery(async () => {
    const projects = await dexie.projects
      .where({ deleted: 0 })
      .sortBy('', sortProjectsByLabelName)

    const projectIds = projects.map((p) => p.id)
    setHorizontalNavIds(projectIds)

    const tables = await dexie.ttables
      .where({
        deleted: 0,
        project_id: projectId,
        type: 'standard',
      })
      .toArray()

    return { projectIds, tables }
  }, [])
  const projectIds: string[] = result?.projectIds ?? []
  const tables: string[] = result?.tables ?? []
  const tablesTo =
    !editing && tables.length === 1
      ? `${['tables', tables[0]?.id, 'rows'].join('/')}`
      : 'tables'
  const tablesTitle =
    !editing && tables.length === 1 ? tables[0]?.name : 'Tabellen'

  const parentPath = resolvePath(`..`, window.location.pathname)?.pathname
  const activeIndex = projectIds.indexOf(projectId)
  const previousId = activeIndex > 0 ? projectIds[activeIndex - 1] : activeIndex
  const previousPath = `${parentPath}/${previousId}`
  const nextId =
    activeIndex === projectIds.length - 1
      ? projectIds[activeIndex]
      : projectIds[activeIndex + 1]
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
        title="Zum vorigen"
        component={Link}
        to={previousPath}
        size="large"
        disabled={activeIndex === 0}
      >
        <FaArrowLeft />
      </IconButton>
      <IconButton
        title="Zum nächsten"
        component={Link}
        to={nextPath}
        size="large"
        disabled={activeIndex === projectIds.length - 1}
      >
        <FaArrowRight />
      </IconButton>
      <MenuChildrenButton
        endIcon={<StyledFaArrowDown />}
        component={Link}
        to={tablesTo}
      >
        {tablesTitle}
      </MenuChildrenButton>
      {editing && (
        <>
          <MenuChildrenButton
            endIcon={<StyledFaArrowDown />}
            component={Link}
            to="tile-layers"
          >
            Bild-Karten
          </MenuChildrenButton>
          <MenuChildrenButton
            endIcon={<StyledFaArrowDown />}
            component={Link}
            to="vector-layers"
          >
            Vektor-Karten
          </MenuChildrenButton>
        </>
      )}
    </>
  )
}

export default observer(ProjectNavButtons)
