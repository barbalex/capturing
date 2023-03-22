import React, { useEffect } from 'react'
import styled from '@emotion/styled'
import { Outlet, Link, useParams } from 'react-router-dom'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

import { StyledSplitPane, resizerWidth } from './Projects'
import constants from '../utils/constants'

const StyledList = styled(List)`
  padding-top: 0;
  padding-bottom: 0;
`
const StyledListItem = styled(ListItem)`
  min-height: ${constants.singleRowHeight};
  border-top: thin solid rgba(74, 20, 140, 0.1);
  border-bottom: ${(props) => (props['data-last'] ? '1px' : 'thin')} solid
    rgba(74, 20, 140, 0.1);
  border-collapse: collapse;
  margin: -1px 0;
  padding: 10px;
  ${(props) =>
    props['data-active'] && `background-color: rgba(74, 20, 140, 0.09);`}
  &:hover {
    background-color: rgba(74, 20, 140, 0.06);
  }
`

const Docs = (): React.FC => {
  const params = useParams()

  useEffect(() => {
    document.title = 'Erfassen: Doku'
  }, [])

  return (
    <StyledSplitPane
      split="vertical"
      size="min(33%, 250px)"
      maxSize={-10}
      resizerStyle={{ width: resizerWidth }}
    >
      <nav aria-label="docs">
        <StyledList>
          <StyledListItem
            component={Link}
            to="image-layer-types"
            data-active={params['*'] === 'image-layer-types'}
          >
            <ListItemText>Image layer types</ListItemText>
          </StyledListItem>
          <StyledListItem
            component={Link}
            to="offline-maps"
            data-active={params['*'] === 'offline-maps'}
          >
            <ListItemText>Offline maps</ListItemText>
          </StyledListItem>
          <StyledListItem
            component={Link}
            to="data-synchronization"
            data-active={params['*'] === 'data-synchronization'}
          >
            <ListItemText>Data synchronization</ListItemText>
          </StyledListItem>
          <StyledListItem
            component={Link}
            to="data-versioning"
            data-active={params['*'] === 'data-versioning'}
          >
            <ListItemText>Data versioning</ListItemText>
          </StyledListItem>
          <StyledListItem
            component={Link}
            to="data-history"
            data-active={params['*'] === 'data-history'}
          >
            <ListItemText>Data history</ListItemText>
          </StyledListItem>
        </StyledList>
      </nav>
      <Outlet />
    </StyledSplitPane>
  )
}

export default Docs
