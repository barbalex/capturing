import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import { FaLongArrowAltUp } from 'react-icons/fa'

import StoreContext from '../../../storeContext'

const ProjectNavButtons = () => {
  const store = useContext(StoreContext)
  const { activeNodeArray, setActiveNodeArray, removeOpenNode } = store

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
    setActiveNodeArray(activeNodeArray.slice(0, -1))
  }, [activeNodeArray, removeOpenNode, setActiveNodeArray])

  return (
    <>
      <IconButton title="Zur Liste" onClick={onClickUp} size="large">
        <FaLongArrowAltUp />
      </IconButton>
    </>
  )
}

export default observer(ProjectNavButtons)
