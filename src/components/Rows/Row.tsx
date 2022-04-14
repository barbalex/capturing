import React, { useContext, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import ListItem from '@mui/material/ListItem'
import { Link } from 'react-router-dom'

import StoreContext from '../../storeContext'
import constants from '../../utils/constants'

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

const RowRow = ({ row }) => {
  const store = useContext(StoreContext)
  const { activeNodeArray } = store

  const [label, setLabel] = useState('')

  useEffect(() => {
    row.label.then((v) => setLabel(v))
  }, [row])

  return (
    <StyledListItem
      component={Link}
      to={`/${[...activeNodeArray, row.id].join('/')}`}
    >
      {label}
    </StyledListItem>
  )
}

export default observer(RowRow)
