import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import { FaArrowUp, FaArrowRight } from 'react-icons/fa'
import { Link, resolvePath } from 'react-router-dom'

import StoreContext from '../../../storeContext'

const ProjectNavButtons = () => {
  const store = useContext(StoreContext)
  const { activeNodeArray, removeNode } = store

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
      <Button endIcon={<FaArrowRight />} component={Link} to="tables">
        Tabellen
      </Button>
    </>
  )
}

export default observer(ProjectNavButtons)
