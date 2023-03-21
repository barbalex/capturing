import React, { useCallback, useContext } from 'react'
import { MdCenterFocusWeak } from 'react-icons/md'
import IconButton from '@mui/material/IconButton'
import { observer } from 'mobx-react-lite'

import ErrorBoundary from './ErrorBoundary'
import storeContext from '../../storeContext'
import boundsFromBbox from '../../utils/boundsFromBbox'
import { IStore } from '../../store'

interface Props {
  bbox: number[]
  geometryExists: boolean
}

const ZoomToButton = ({ bbox, geometryExists }: Props) => {
  const store: IStore = useContext(storeContext)
  const { showMap, setShowMap, flyToMapBounds } = store

  const onClick = useCallback(async () => {
    if (!showMap) setShowMap(true)
    setTimeout(() => flyToMapBounds(boundsFromBbox(bbox)))
  }, [showMap, setShowMap, flyToMapBounds, bbox])

  return (
    <ErrorBoundary>
      <IconButton
        aria-label="in Karte fokussieren"
        title="in Karte fokussieren"
        onClick={onClick}
        size="large"
        disabled={!geometryExists}
      >
        <MdCenterFocusWeak />
      </IconButton>
    </ErrorBoundary>
  )
}

export default observer(ZoomToButton)
