import React from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { withResizeDetector } from 'react-resize-detector'

import DeleteButton from './DeleteButton'
import AddButton from './AddButton'
import NavButtons from './NavButtons'
import FilterNumbers from '../../shared/FilterNumbers'
import Menu from '../../shared/Menu'
import constants from '../../../utils/constants'

const TitleContainer = styled.div`
  background-color: rgba(74, 20, 140, 0.1);
  display: flex;
  flex-shrink: 0;
  flex-grow: 0;
  flex-wrap: wrap;
  justify-content: space-between;
  padding 0 10px;
  @media print {
    display: none !important;
  }
`
const Title = styled.div`
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
  padding-right: 40px;
  user-select: none;
  height: 52px;
  line-height: 52px;
  text-align: center;
`
const TitleSymbols = styled.div`
  display: flex;
  margin-top: auto;
  margin-bottom: auto;
  justify-content: flex-end;
  flex-grow: 1;
  flex-wrap: wrap;
`

const TableFormTitle = ({
  row,
  totalCount,
  filteredCount,
  width,
  userMayEdit,
}) => {
  if (width < 520) {
    return (
      <TitleContainer>
        <Title>Tabelle</Title>
        <TitleSymbols>
          <NavButtons />
          <AddButton userMayEdit={userMayEdit} />
          <DeleteButton row={row} userMayEdit={userMayEdit} />
          <Menu white={false}>
            <FilterNumbers
              filteredCount={filteredCount}
              totalCount={totalCount}
              asMenu
            />
          </Menu>
        </TitleSymbols>
      </TitleContainer>
    )
  }

  return (
    <TitleContainer>
      <Title>Tabelle</Title>
      <TitleSymbols>
        <NavButtons />
        <AddButton userMayEdit={userMayEdit} />
        <DeleteButton row={row} userMayEdit={userMayEdit} />
        <FilterNumbers filteredCount={filteredCount} totalCount={totalCount} />
      </TitleSymbols>
    </TitleContainer>
  )
}

export default withResizeDetector(observer(TableFormTitle))