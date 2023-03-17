import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import { FaArrowUp, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { Link, resolvePath, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../storeContext'
import { dexie } from '../../../dexieClient'
import { IStore } from '../../../store'

const TileLayerNavButtons = () => {
  const { projectId, tileLayerId } = useParams()

  const store: IStore = useContext(StoreContext)
  const { activeNodeArray, removeNode, setHorizontalNavIds } = store

  const tileLayerIds: string[] =
    useLiveQuery(async () => {
      const tileLayers = await dexie.tile_layers
        .where({ deleted: 0, project_id: projectId })
        .sortBy('sort')

      const ids = tileLayers.map((p) => p.id)
      setHorizontalNavIds(ids)

      return ids
    }, [projectId]) ?? []

  const parentPath = resolvePath(`..`, window.location.pathname)?.pathname
  const activeIndex = tileLayerIds.indexOf(tileLayerId)
  const previousId =
    activeIndex > 0 ? tileLayerIds[activeIndex - 1] : activeIndex
  const previousPath = `${parentPath}/${previousId}`
  const nextId =
    activeIndex === tileLayerIds.length - 1
      ? tileLayerIds[activeIndex]
      : tileLayerIds[activeIndex + 1]
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
        disabled={activeIndex === tileLayerIds.length - 1}
      >
        <FaArrowRight />
      </IconButton>
    </>
  )
}

export default observer(TileLayerNavButtons)
