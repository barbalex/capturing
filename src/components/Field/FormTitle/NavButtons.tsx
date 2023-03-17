import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import { FaArrowUp, FaArrowRight, FaArrowLeft } from 'react-icons/fa'
import { Link, resolvePath, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../storeContext'
import { dexie } from '../../../dexieClient'
import { IStore } from '../../../store'

const FieldNavButtons = () => {
  const { tableId, fieldId } = useParams()
  const store: IStore = useContext(StoreContext)
  const { activeNodeArray, removeNode, setHorizontalNavIds } = store

  const fieldIds: string[] =
    useLiveQuery(async () => {
      const fields = await dexie.fields
        .where({ deleted: 0, table_id: tableId })
        .sortBy('sort')
      const ids = fields.map((t) => t.id)
      setHorizontalNavIds(ids)

      return ids
    }, [tableId]) ?? []

  const parentPath = resolvePath(`..`, window.location.pathname)?.pathname
  const activeIndex = fieldIds.indexOf(fieldId)
  const previousId = activeIndex > 0 ? fieldIds[activeIndex - 1] : activeIndex
  const previousPath = `${parentPath}/${previousId}`
  const nextId =
    activeIndex === fieldIds.length - 1
      ? fieldIds[activeIndex]
      : fieldIds[activeIndex + 1]
  const nextPath = `${parentPath}/${nextId}`

  const onClickUp = useCallback(() => {
    removeNode(activeNodeArray)
  }, [activeNodeArray, removeNode])

  return (
    <>
      <IconButton
        title="Zur Liste"
        component={Link}
        to={resolvePath(`..`, window.location.pathname)}
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
        disabled={activeIndex === fieldIds.length - 1}
      >
        <FaArrowRight />
      </IconButton>
    </>
  )
}

export default observer(FieldNavButtons)
