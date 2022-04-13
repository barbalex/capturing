import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import { FaArrowUp, FaArrowRight } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'

import StoreContext from '../../../storeContext'

const ProjectNavButtons = () => {
  const navigate = useNavigate()
  const store = useContext(StoreContext)
  const { activeNodeArray, removeOpenNode } = store

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
    navigate(`/${activeNodeArray.slice(0, -1).join('/')}`)
  }, [activeNodeArray, navigate, removeOpenNode])

  return (
    <>
      <IconButton title="Zur Liste" onClick={onClickUp} size="large">
        <FaArrowUp />
      </IconButton>
      <Button endIcon={<FaArrowRight />} component={Link} to="tables">
        Tabellen
      </Button>
    </>
  )
}

export default observer(ProjectNavButtons)
