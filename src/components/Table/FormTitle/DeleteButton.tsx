import React, { useContext, useState, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { FaMinus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { Session } from '@supabase/supabase-js'
import { useNavigate, resolvePath } from 'react-router-dom'

import StoreContext from '../../../storeContext'
import ErrorBoundary from '../../shared/ErrorBoundary'
import { supabase } from '../../../supabaseClient'

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding-right: 16px;
  user-select: none;
`
const Title = styled.div`
  padding: 12px 16px;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 700;
  user-select: none;
`

const TableDeleteButton = ({ row, userMayEdit }) => {
  const navigate = useNavigate()
  const store = useContext(StoreContext)
  const { activeNodeArray, removeOpenNodeWithChildren } = store
  // const filter = { todo: 'TODO: was in store' }
  const session: Session = supabase.auth.session()

  const [anchorEl, setAnchorEl] = useState(null)
  const closeMenu = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const onClickButton = useCallback(
    (event) => setAnchorEl(event.currentTarget),
    [],
  )
  const remove = useCallback(() => {
    row.deleteOnServerAndClient({ session })
    setAnchorEl(null)
    // need to remove openNode from openNodes
    removeOpenNodeWithChildren(activeNodeArray)
    navigate(resolvePath(`..`, window.location.pathname))
  }, [activeNodeArray, navigate, removeOpenNodeWithChildren, row, session])

  return (
    <ErrorBoundary>
      <IconButton
        aria-controls="menu"
        aria-haspopup="true"
        aria-label="Tabelle löschen"
        title="Tabelle löschen"
        onClick={onClickButton}
        disabled={row.deleted === 1 || !userMayEdit}
        size="large"
      >
        <FaMinus />
      </IconButton>
      <Menu
        id="menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={closeMenu}
      >
        <TitleRow>
          <Title>Wirklich löschen?</Title>
        </TitleRow>
        <MenuItem onClick={remove}>Ja, weg damit!</MenuItem>
        <MenuItem onClick={closeMenu}>Nein, abbrechen!</MenuItem>
      </Menu>
    </ErrorBoundary>
  )
}

export default observer(TableDeleteButton)
