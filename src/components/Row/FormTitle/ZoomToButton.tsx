import React, { useCallback, useContext } from 'react'
import { MdCenterFocusWeak } from 'react-icons/md'
import IconButton from '@mui/material/IconButton'
import { observer } from 'mobx-react-lite'

import ErrorBoundary from '../../shared/ErrorBoundary'
import { Row } from '../../../dexieClient'
import storeContext from '../../../storeContext'
import boundsFromBbox from '../../../utils/boundsFromBbox'

type Props = {
  row: Row
}

const RowAddButton = ({ row }: Props) => {
  const store = useContext(storeContext)
  const { showMap, setShowMap, map } = store

  const onClick = useCallback(async () => {
    if (!showMap) setShowMap(true)
    map.flyToBounds(boundsFromBbox(row.bbox))
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

export default observer(RowAddButton)
