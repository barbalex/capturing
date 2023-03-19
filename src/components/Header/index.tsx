import React, { useContext } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'

import ErrorBoundary from '../shared/ErrorBoundary'
import constants from '../../utils/constants'
import Anonymus from './Anonymus'
import Authenticated from './Authenticated'
import storeContext from '../../storeContext'
import { IStore } from '../../store'

// TODO: add more header bars for: filter, search, online, account
// TODO: make this adapt to screen width, see vermehrung

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
  const store: IStore = useContext(storeContext)
  const { session } = store
  // console.log({ session })

  return (
    <ErrorBoundary>
      <StyledAppBar position="static">
        <Toolbar>{session ? <Authenticated /> : <Anonymus />}</Toolbar>
      </StyledAppBar>
    </ErrorBoundary>
  )
}

export default observer(Header)
