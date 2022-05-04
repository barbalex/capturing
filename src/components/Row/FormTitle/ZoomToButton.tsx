import React, { useCallback, useContext } from 'react'
import { MdCenterFocusWeak } from 'react-icons/md'
import IconButton from '@mui/material/IconButton'
import { useParams } from 'react-router-dom'

import ErrorBoundary from '../../shared/ErrorBoundary'
import { Row } from '../../../dexieClient'
import storeContext from '../../../storeContext'

type Props = {
  row: Row
}

const RowAddButton = ({ row }: Props) => {
  const { rowId } = useParams()

  const store = useContext(storeContext)
  const { showMap, setShowMap, setBounds } = store

  const onClick = useCallback(async () => {
    // TODO:
    // if needed, open map
    if (!showMap) setShowMap(true)
    // set bounds
    setBounds([row.bbox])
  }, [row.bbox, setBounds, setShowMap, showMap])

  return (
    <ErrorBoundary>
      <IconButton
        aria-label="in Karte fokussieren"
        title="in Karte fokussieren"
        onClick={onClick}
        size="large"
        disabled={!row.geometry}
      >
        <MdCenterFocusWeak />
      </IconButton>
    </ErrorBoundary>
  )
}

export default RowAddButton
