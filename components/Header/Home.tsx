import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { FaHome } from 'react-icons/fa'
import styled from 'styled-components'
import NextLink from 'next/link'
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
  text-transform: none !important;
  &:hover {
    border-width: 1px !important;
  }
`

// https://github.com/mui/material-ui/issues/30858
const LinkComponent = () => (
  <NextLink href="/" passHref>
    <a>MyLink</a>
  </NextLink>
)

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
                aria-label="Home"
                component={Link}
                to="/"
                title="Home"
                size="large"
              >
                <FaHome />
              </IconButton>
            )
          ) : (
            <SiteTitle variant="outlined" component={Link} to="/" title="Home">
              Capturing
            </SiteTitle>
          )}
          <Spacer />
          <NavButton variant="outlined" component={Link} to="/projects/">
            Data
          </NavButton>
          <NavButton variant="outlined" component={Link} to="/docs">
            Docs
          </NavButton>
          <NavButton variant="outlined" component={Link} to="/account/">
            Account
          </NavButton>
        </Toolbar>
      </AppBar>
    </ErrorBoundary>
  )
}

export default HeaderHome
