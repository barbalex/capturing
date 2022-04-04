import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import ErrorBoundary from '../shared/ErrorBoundary'
import constants from '../../utils/constants'
import Home from './Home'

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
  const { pathname } = useRouter()
  const isHome = pathname === '/'
  const isProjects = pathname.startsWith('/projects')

  return (
    <ErrorBoundary>
      <StyledAppBar position="static">
        <Toolbar>
          {isHome ? <Home /> : isProjects ? <Home /> : <Home />}
        </Toolbar>
      </StyledAppBar>
    </ErrorBoundary>
  )
}

export default Header
