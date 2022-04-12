import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { FaPlus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { useParams, useNavigate } from 'react-router-dom'

import ErrorBoundary from '../../shared/ErrorBoundary'
import insertTable from '../../../utils/insertTable'
import StoreContext from '../../../storeContext'

const TableAddButton = ({ userMayEdit }) => {
  const { activeNodeArray } = useContext(StoreContext)
  const { projectId } = useParams()
  const navigate = useNavigate()

  const onClick = useCallback(async () => {
    const newProjectId = await insertTable({ projectId })
    navigate(`/${[...activeNodeArray.slice(0, -1), newProjectId].join('/')}`)
  }, [activeNodeArray, navigate, projectId])

  return (
    <ErrorBoundary>
      <IconButton
        aria-label="neue Tabelle"
        title="neue Tabelle"
        onClick={onClick}
        size="large"
        disabled={!userMayEdit}
      >
        <FaPlus />
      </IconButton>
    </ErrorBoundary>
  )
}

export default observer(TableAddButton)
