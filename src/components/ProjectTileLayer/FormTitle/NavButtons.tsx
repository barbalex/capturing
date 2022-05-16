import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import { FaArrowUp, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { Link, resolvePath } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import StoreContext from '../../../storeContext'
import { dexie, ProjectTileLayer } from '../../../dexieClient'

const ProjectTileLayerNavButtons = () => {
  const { projectId, projectTileLayerId } = useParams()
  const store = useContext(StoreContext)
  const { activeNodeArray, removeNode } = store

  const projectTileLayerIds: string[] =
    useLiveQuery(async () => {
      const projectTileLayers: ProjectTileLayer[] =
        await dexie.project_tile_layers
          .where({ deleted: 0, project_id: projectId })
          .sortBy('sort')
      return projectTileLayers.map((p) => p.id)
    }, [projectId]) ?? []

  const activeIndex = (projectTileLayerIds ?? []).indexOf(projectTileLayerId)
  const previousId =
    activeIndex > 0 ? projectTileLayerIds[activeIndex - 1] : activeIndex
  const nextId =
    activeIndex === projectTileLayerIds.length - 1
      ? projectTileLayerIds[activeIndex]
      : projectTileLayerIds[activeIndex + 1]
  const parentPath = resolvePath(`..`, window.location.pathname)?.pathname
  const previousPath = `${parentPath}/${previousId}`
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
        disabled={activeIndex === projectTileLayerIds.length - 1}
      >
        <FaArrowRight />
      </IconButton>
    </>
  )
}

export default observer(ProjectTileLayerNavButtons)
