import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { FaPlus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { useParams, useNavigate } from 'react-router-dom'

import StoreContext from '../../../storeContext'
import ErrorBoundary from '../../shared/ErrorBoundary'
import insertRow from '../../../utils/insertRow'

const RowAddButton = () => {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const { activeNodeArray } = useContext(StoreContext)

  const onClick = useCallback(async () => {
    const newId = await insertRow({ tableId })
    navigate(`/${[...activeNodeArray.slice(0, -1), newId].join('/')}`)
  }, [activeNodeArray, navigate, tableId])

  return (
    <ErrorBoundary>
      <IconButton
        aria-label="neuen Datensatz"
        title="neuen Datensatz"
        onClick={onClick}
        size="large"
      >
        <FaPlus />
      </IconButton>
    </ErrorBoundary>
  )
}

export default observer(RowAddButton)
