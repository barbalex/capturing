import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { FaHome } from 'react-icons/fa'
import styled from 'styled-components'
import { useResizeDetector } from 'react-resize-detector'
import { useRouter } from 'next/router'

import ErrorBoundary from '../shared/ErrorBoundary'
import Link from '../shared/Link'
import constants from '../../utils/constants'

const SiteTitle = styled(Button)`
  display: none;
  color: white !important;
  font-size: 20px !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  border-width: 0 !important;
  text-transform: unset !important;
  @media (min-width: 700px) {
    display: block;
  }
  &:hover {
    border-width: 1px !important;
  }
`
const Spacer = styled.div`
  flex-grow: 1;
`

const NavButton = styled(Button)`
  color: white !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  border-width: 0 !important;
  border-width: ${(props) =>
    props.disabled ? '1px !important' : '0 !important'};
  text-transform: none !important;
  &:hover {
    border-width: 1px !important;
  }
`

const HeaderHome = () => {
  const { pathname } = useRouter()
  const { width, ref: resizeRef } = useResizeDetector()
  const mobile = width && width < constants?.tree?.minimalWindowWidth
  const isHome = pathname === '/'

  return (
    <ErrorBoundary>
      <AppBar position="fixed" ref={resizeRef}>
        <Toolbar>
          {mobile ? (
            isHome ? (
              <div />
            ) : (
              <IconButton
                color="inherit"
                //aria-label="Home"
                component={Link}
                to="/"
                title="Home"
                size="large"
              >
                <FaHome />
              </IconButton>
            )
          ) : (
            <SiteTitle
              variant="outlined"
              component={Link}
              to="/"
              title="Home"
              disabled={pathname === '/'}
            >
              Capturing
            </SiteTitle>
          )}
          <Spacer />
          <NavButton
            variant="outlined"
            component={Link}
            to="/projects"
            disabled={pathname === '/projects'}
          >
            Projects
          </NavButton>
          <NavButton
            variant="outlined"
            component={Link}
            to="/docs"
            disabled={pathname === '/docs'}
          >
            Docs
          </NavButton>
          <NavButton
            variant="outlined"
            component={Link}
            to="/account"
            disabled={pathname === '/account'}
          >
            Account
          </NavButton>
        </Toolbar>
      </AppBar>
    </ErrorBoundary>
  )
}

export default HeaderHome
