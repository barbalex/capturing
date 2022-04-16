import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import { FaArrowUp } from 'react-icons/fa'
import { Link, resolvePath } from 'react-router-dom'

import StoreContext from '../../../storeContext'

const FieldNavButtons = () => {
  const store = useContext(StoreContext)
  const { activeNodeArray, removeOpenNode } = store

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
  }, [activeNodeArray, removeOpenNode])

  return (
    <IconButton
      title="Zur Liste"
      component={Link}
      to={resolvePath(`..`, window.location.pathname)}
      onClick={onClickUp}
      size="large"
    >
      <FaArrowUp />
    </IconButton>
  )
}

export default observer(FieldNavButtons)
