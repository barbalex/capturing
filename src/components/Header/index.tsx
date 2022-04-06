import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import styled from 'styled-components'
import { useLocation } from 'react-router-dom'

import ErrorBoundary from '../shared/ErrorBoundary'
import constants from '../../utils/constants'
import Anonymus from './Anonymus'
import Authenticated from './Authenticated'
import { supabase } from '../../supabaseClient'

// TODO: add more header bars for projects and docs

const StyledAppBar = styled(AppBar)`
  min-height: ${constants.appBarHeight}px !important;
  .MuiToolbar-root {
    min-height: ${constants.appBarHeight}px !important;
    padding-left: 0 !important;
    padding-right: 10px !important;
  }
  @media print {
    display: none !important;
  }
`
const Header = () => {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const isProjects = pathname.startsWith('/projects')
  const session = supabase.auth.session()

  return (
    <ErrorBoundary>
      <StyledAppBar position="static">
        <Toolbar>{session ? <Authenticated /> : <Anonymus />}</Toolbar>
      </StyledAppBar>
    </ErrorBoundary>
  )
}

export default Header
