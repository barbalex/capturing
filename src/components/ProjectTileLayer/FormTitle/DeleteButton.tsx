import React, { useContext, useState, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { FaMinus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { Session } from '@supabase/supabase-js'
import { useNavigate, resolvePath, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../storeContext'
import ErrorBoundary from '../../shared/ErrorBoundary'
import { supabase } from '../../../supabaseClient'
import { dexie, Table } from '../../../dexieClient'

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

const ProjectTileLayerDeleteButton = ({ userMayEdit }) => {
  const navigate = useNavigate()
  const { projectTileLayerId } = useParams()
  const store = useContext(StoreContext)
  const { activeNodeArray, removeNodeWithChildren } = store
  // const filter = { todo: 'TODO: was in store' }
  const session: Session = supabase.auth.session()

  const deleted: boolean = useLiveQuery(async () => {
    const row: Row = await dexie.project_tile_layers.get(projectTileLayerId)
    // only return needed values to minimize re-renders
    return row?.deleted
  }, [projectTileLayerId])

  const [anchorEl, setAnchorEl] = useState(null)
  const closeMenu = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const onClickButton = useCallback(
    (event) => setAnchorEl(event.currentTarget),
    [],
  )
  const remove = useCallback(async () => {
    const row: Table = await dexie.project_tile_layers.get(projectTileLayerId)
    row.deleteOnServerAndClient({ session })
    setAnchorEl(null)
    // need to remove node from nodes
    removeNodeWithChildren(activeNodeArray)
    navigate(resolvePath(`..`, window.location.pathname))
  }, [
    activeNodeArray,
    navigate,
    removeNodeWithChildren,
    session,
    projectTileLayerId,
  ])

  return (
    <ErrorBoundary>
      <IconButton
        aria-controls="menu"
        aria-haspopup="true"
        aria-label="Bild-Karte löschen"
        title="Bild-Karte löschen"
        onClick={onClickButton}
        disabled={deleted === 1 || !userMayEdit}
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

export default observer(ProjectTileLayerDeleteButton)
