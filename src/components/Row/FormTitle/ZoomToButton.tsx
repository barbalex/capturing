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
  const { showMap, setShowMap, setBounds, map } = store

  const onClick = useCallback(async () => {
    // TODO:
    // if needed, open map
    if (!showMap) setShowMap(true)
    // set bounds
    // bounds can be: 8.508405, 46.867706, 8.812996, 47.156177
    const bounds = [
      [row.bbox[1], row.bbox[0]],
      [row.bbox[3], row.bbox[2]],
    ]
    console.log('ZoomToButton, onClick', { bbox: row.bbox, map, bounds })
    map.fitBounds(bounds)
    //setBounds([row.bbox])
  }, [map, row.bbox, setShowMap, showMap])

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
