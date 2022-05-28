import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import { FaArrowUp, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { Link, resolvePath, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../storeContext'
import { MenuChildrenButton } from '../../Table/FormTitle/NavButtons'
import { dexie } from '../../../dexieClient'
import sortProjectsByLabelName from '../../../utils/sortProjectsByLabelName'

const ProjectNavButtons = () => {
  const { projectId } = useParams()

  const store = useContext(StoreContext)
  const { activeNodeArray, removeNode, setHorizontalNavIds } = store

  const projectIds: string[] =
    useLiveQuery(async () => {
      const projects = await dexie.projects
        .where({ deleted: 0 })
        .sortBy('', sortProjectsByLabelName)

      const ids = projects.map((p) => p.id)
      setHorizontalNavIds(ids)

      return ids
    }, []) ?? []

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
        endIcon={<FaArrowRight />}
        component={Link}
        to="tables"
      >
        Tabellen
      </MenuChildrenButton>
      <MenuChildrenButton
        endIcon={<FaArrowRight />}
        component={Link}
        to="tile-layers"
      >
        Bild-Karten
      </MenuChildrenButton>
      <MenuChildrenButton
        endIcon={<FaArrowRight />}
        component={Link}
        to="vector-layers"
      >
        Vektor-Karten
      </MenuChildrenButton>
    </>
  )
}

export default observer(ProjectNavButtons)
