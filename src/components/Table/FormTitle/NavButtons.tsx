import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import { FaArrowUp, FaArrowRight } from 'react-icons/fa'
import { Link, useParams, resolvePath } from 'react-router-dom'
import styled from 'styled-components'

import StoreContext from '../../../storeContext'

export const MenuChildrenButton = styled(Button)`
  .MuiButton-endIcon {
    margin-left: 4px;
  }
`

const TableNavButtons = () => {
  const { projectId } = useParams()
  const store = useContext(StoreContext)
  const { activeNodeArray, removeNode, editingProjects } = store
  const editing = editingProjects.get(projectId)?.editing ?? false

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
      {!!editing && (
        <MenuChildrenButton
          endIcon={<FaArrowRight />}
          component={Link}
          to="fields"
        >
          Felder
        </MenuChildrenButton>
      )}
      <MenuChildrenButton endIcon={<FaArrowRight />} component={Link} to="rows">
        Datensätze
      </MenuChildrenButton>
    </>
  )
}

export default observer(TableNavButtons)
