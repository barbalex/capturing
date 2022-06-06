import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import { FaArrowUp, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { Link, resolvePath } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import StoreContext from '../../../storeContext'
import { dexie, ProjectVectorLayer } from '../../../dexieClient'

const ProjectVectorLayerNavButtons = () => {
  const { projectId, projectVectorLayerId } = useParams()
  const store = useContext(StoreContext)
  const { activeNodeArray, removeNode, setHorizontalNavIds } = store

  const projectVectorLayerIds: string[] =
    useLiveQuery(async () => {
      const vectorLayers: ProjectVectorLayer[] =
        await dexie.vector_layers
          .where({ deleted: 0, project_id: projectId })
          .sortBy('sort')

      const ids = vectorLayers.map((p) => p.id)
      setHorizontalNavIds(ids)

      return ids
    }, [projectId]) ?? []

  const parentPath = resolvePath(`..`, window.location.pathname)?.pathname
  const activeIndex = projectVectorLayerIds.indexOf(projectVectorLayerId)
  const previousId =
    activeIndex > 0 ? projectVectorLayerIds[activeIndex - 1] : activeIndex
  const previousPath = `${parentPath}/${previousId}`
  const nextId =
    activeIndex === projectVectorLayerIds.length - 1
      ? projectVectorLayerIds[activeIndex]
      : projectVectorLayerIds[activeIndex + 1]
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
        disabled={activeIndex === projectVectorLayerIds.length - 1}
      >
        <FaArrowRight />
      </IconButton>
    </>
  )
}

export default observer(ProjectVectorLayerNavButtons)
