import React, { useCallback, useContext } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { FaHome } from 'react-icons/fa'
import styled from 'styled-components'
import { useResizeDetector } from 'react-resize-detector'
import { Link, useLocation } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

import ErrorBoundary from '../../shared/ErrorBoundary'
import constants from '../../../utils/constants'
import storeContext from '../../../storeContext'
import Account from './Account'
import ServerConnected from './ServerConnected'

const SiteTitle = styled(Button)`
  display: none;
  color: white !important;
  font-size: 20px !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  border-width: 0 !important;
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
  &:hover {
    border-width: 1px !important;
  }
`
const SubNavButton = styled(Button)`
  color: white !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  border-width: 0 !important;
  border-width: ${(props) =>
    props.active === 'true' ? '1px !important' : '0 !important'};
  &:hover {
    border-width: 1px !important;
  }
`

const HeaderAuthenticated = () => {
  const store = useContext(storeContext)
  const { showTree, showForm, showMap, setShowTree, setShowForm, setShowMap } =
    store

  const { pathname } = useLocation()
  const { width, ref: resizeRef } = useResizeDetector()
  const mobile = width && width < constants?.tree?.minimalWindowWidth
  const isHome = pathname === '/'
  const isProject = pathname.includes('/projects')

  const onClickTree = useCallback(() => {
    setShowTree(!showTree)
  }, [setShowTree, showTree])
  const onClickForm = useCallback(() => {
    setShowForm(!showForm)
  }, [setShowForm, showForm])
  const onClickMap = useCallback(() => {
    setShowMap(!showMap)
  }, [setShowMap, showMap])

  console.log({ pathname })

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
          {isProject ? (
            <>
              <SubNavButton
                variant="outlined"
                onClick={onClickTree}
                active={showTree.toString()}
              >
                Strukturbaum
              </SubNavButton>
              <SubNavButton
                variant="outlined"
                onClick={onClickForm}
                active={showForm.toString()}
              >
                Formular
              </SubNavButton>
              <SubNavButton
                variant="outlined"
                onClick={onClickMap}
                active={showMap.toString()}
              >
                Karte
              </SubNavButton>
            </>
          ) : (
            <NavButton
              variant="outlined"
              component={Link}
              to="/projects"
              disabled={isProject}
            >
              Projects
            </NavButton>
          )}
          <NavButton
            variant="outlined"
            component={Link}
            to="/docs"
            disabled={pathname.includes('/docs')}
            title="Dokumentation"
          >
            Doku
          </NavButton>
          <ServerConnected />
          <Account />
        </Toolbar>
      </AppBar>
    </ErrorBoundary>
  )
}

export default observer(HeaderAuthenticated)
