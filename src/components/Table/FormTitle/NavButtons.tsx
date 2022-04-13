import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import { FaArrowUp, FaArrowRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import StoreContext from '../../../storeContext'

const ProjectNavButtons = () => {
  const store = useContext(StoreContext)
  const { activeNodeArray, removeOpenNode } = store

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
  }, [activeNodeArray, removeOpenNode])

  return (
    <>
      <IconButton
        title="Zur Liste"
        component={Link}
        to={`/${activeNodeArray.slice(0, -1).join('/')}`}
        onClick={onClickUp}
        size="large"
      >
        <FaArrowUp />
      </IconButton>
      <Button endIcon={<FaArrowRight />} component={Link} to="fields">
        Felder
      </Button>
      <Button endIcon={<FaArrowRight />} component={Link} to="rows">
        Datensätze
      </Button>
    </>
  )
}

export default observer(ProjectNavButtons)
