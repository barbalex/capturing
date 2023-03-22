import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import { FaArrowUp, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { Link, resolvePath } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import StoreContext from '../../../storeContext'
import { dexie, VectorLayer } from '../../../dexieClient'
import { IStore } from '../../../store'

const VectorLayerNavButtons = () => {
  const { projectId, vectorLayerId } = useParams()
  const store: IStore = useContext(StoreContext)
  const { activeNodeArray, removeNode, setHorizontalNavIds } = store

  const vectorLayerIds: string[] | undefined =
    useLiveQuery(async () => {
      const vectorLayers: VectorLayer[] = await dexie.vector_layers
        .where({ deleted: 0, project_id: projectId })
        .sortBy('sort')

      const ids = vectorLayers.map((p) => p.id)
      setHorizontalNavIds(ids)

      return ids
    }, [projectId]) ?? []

  const parentPath = resolvePath(`..`, window.location.pathname)?.pathname
  const activeIndex = vectorLayerIds.indexOf(vectorLayerId)
  const previousId =
    activeIndex > 0 ? vectorLayerIds[activeIndex - 1] : activeIndex
  const previousPath = `${parentPath}/${previousId}`
  const nextId =
    activeIndex === vectorLayerIds.length - 1
      ? vectorLayerIds[activeIndex]
      : vectorLayerIds[activeIndex + 1]
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
        disabled={activeIndex === vectorLayerIds.length - 1}
      >
        <FaArrowRight />
      </IconButton>
    </>
  )
}

export default observer(VectorLayerNavButtons)
