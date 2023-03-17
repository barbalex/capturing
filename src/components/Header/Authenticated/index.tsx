import React, { useCallback, useContext } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { FaHome } from 'react-icons/fa'
import { MdPerson, MdPersonOutline } from 'react-icons/md'
import styled from '@emotion/styled'
import { useResizeDetector } from 'react-resize-detector'
import { Link, useLocation } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

import ErrorBoundary from '../../shared/ErrorBoundary'
import constants from '../../../utils/constants'
import storeContext from '../../../storeContext'
import ServerConnected from './ServerConnected'
import { IStore } from '../../../store'

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
  ${(props) =>
    props.active === 'true' &&
    'border: 1px solid rgba(255, 255, 255, 0.5) !important;'}
  ${(props) =>
    props.prevactive === 'true' &&
    'border-bottom-left-radius: 0 !important; border-top-left-radius: 0 !important;'}
  ${(props) =>
    props.nextactive === 'true' &&
    'border-bottom-right-radius: 0 !important; border-top-right-radius: 0 !important; border-right-color: #4a148c !important;'}
  &:hover {
    outline: 1px solid rgba(255, 255, 255, 0.5) !important;
  }
`
const UserIconFilled = styled(MdPersonOutline)`
  color: white;
`
const UserIcon = styled(MdPerson)`
  color: white;
`
// const UserIcon = styled(FaUserCircle)`
//   color: rgb(74, 20, 140);
//   /* fill: white; */
//   background-color: rgba(0, 0, 0, 0);
// `

const HeaderAuthenticated = () => {
  const store: IStore = useContext(storeContext)
  const { showTree, showForm, showMap, setShowTree, setShowForm, setShowMap } =
    store

  const { pathname } = useLocation()
  const { width, ref: resizeRef } = useResizeDetector()
  const mobile = width && width < constants?.tree?.minimalWindowWidth
  const isHome = pathname === '/'
  const isProject = pathname.includes('/projects')
  const isUser = pathname.includes('/user')

  const onClickTree = useCallback(() => {
    setShowTree(!showTree)
  }, [setShowTree, showTree])
  const onClickForm = useCallback(() => {
    setShowForm(!showForm)
  }, [setShowForm, showForm])
  const onClickMap = useCallback(() => {
    setShowMap(!showMap)
  }, [setShowMap, showMap])

  // console.log({ isUser })

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
              Erfassen
            </SiteTitle>
          )}
          <Spacer />
          {isProject ? (
            <>
              <SubNavButton
                variant="outlined"
                onClick={onClickTree}
                active={showTree.toString()}
                nextactive={showForm.toString()}
              >
                Strukturbaum
              </SubNavButton>
              <SubNavButton
                variant="outlined"
                onClick={onClickForm}
                active={showForm.toString()}
                prevactive={showTree.toString()}
                nextactive={showMap.toString()}
              >
                Formular
              </SubNavButton>
              <SubNavButton
                variant="outlined"
                onClick={onClickMap}
                active={showMap.toString()}
                prevactive={showForm.toString()}
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
              Daten
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
          <IconButton
            aria-label="Konto"
            title="Konto und Daten verwalten"
            component={Link}
            to="/user"
            disabled={isUser}
          >
            {isUser ? <UserIconFilled /> : <UserIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
    </ErrorBoundary>
  )
}

export default observer(HeaderAuthenticated)
