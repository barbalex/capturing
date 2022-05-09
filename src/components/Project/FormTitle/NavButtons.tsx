import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import { FaArrowUp, FaArrowRight } from 'react-icons/fa'
import { Link, resolvePath } from 'react-router-dom'

import StoreContext from '../../../storeContext'
import { MenuChildrenButton } from '../../Table/FormTitle/NavButtons'

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
      <MenuChildrenButton
        endIcon={<FaArrowRight />}
        component={Link}
        to="tables"
      >
        Tabellen
      </MenuChildrenButton>
      <MenuChildrenButton
        endIcon={<FaArrowRight />}
        component={Link}
        to="tile-layers"
      >
        Bild-Karten
      </MenuChildrenButton>
      <MenuChildrenButton
        endIcon={<FaArrowRight />}
        component={Link}
        to="vector-layers"
      >
        Vektor-Karten
      </MenuChildrenButton>
    </>
  )
}

export default observer(ProjectNavButtons)
