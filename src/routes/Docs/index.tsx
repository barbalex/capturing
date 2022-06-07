import React, { useEffect } from 'react'
import styled from 'styled-components'
import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

import { StyledSplitPane, resizerWidth } from '../Projects'
import constants from '../../utils/constants'

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
  &:hover {
    background-color: rgba(74, 20, 140, 0.03);
  }
`

const Docs = () => {
  useEffect(() => {
    document.title = 'Erfassen: Doku'
  }, [])

  return (
    <StyledSplitPane
      split="vertical"
      size="33%"
      maxSize={-10}
      resizerStyle={{ width: resizerWidth }}
    >
      <nav aria-label="docs">
        <StyledList>
          <StyledListItem component={Link} to="image-layer-types">
            <ListItemText>Image-Layer types</ListItemText>
          </StyledListItem>
        </StyledList>
      </nav>
      <Outlet />
    </StyledSplitPane>
  )
}

export default Docs
