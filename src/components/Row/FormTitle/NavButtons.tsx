import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import { FaArrowUp, FaArrowRight, FaArrowLeft } from 'react-icons/fa'
import { Link, resolvePath, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../storeContext'
import { dexie, Row } from '../../../dexieClient'
import rowsWithLabelFromRows from '../../../utils/rowsWithLabelFromRows'
import { IStore } from '../../../store'

type Props = {
  level: number
}

const RowNavButtons = ({ level }: Props) => {
  const params = useParams()
  const tableId = params[`tableId${level}`]
  const rowId = params[`rowId${level}`]
  const store: IStore = useContext(StoreContext)
  const { activeNodeArray, removeNode, setHorizontalNavIds } = store

  const rowIds: string[] =
    useLiveQuery(async () => {
      const rows: Row[] = await dexie.rows
        .where({ deleted: 0, table_id: tableId })
        .toArray()

      const rWL = await rowsWithLabelFromRows(rows)
      const ids = rWL.map((r) => r.id)
      setHorizontalNavIds(ids)

      return ids
    }, [tableId]) ?? []

  const parentPath = resolvePath(`..`, window.location.pathname)?.pathname
  const activeIndex = rowIds.indexOf(rowId)
  const previousId = activeIndex > 0 ? rowIds[activeIndex - 1] : activeIndex
  const previousPath = `${parentPath}/${previousId}`
  const nextId =
    activeIndex === rowIds.length - 1
      ? rowIds[activeIndex]
      : rowIds[activeIndex + 1]
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
        disabled={activeIndex === rowIds.length - 1}
      >
        <FaArrowRight />
      </IconButton>
    </>
  )
}

export default observer(RowNavButtons)
