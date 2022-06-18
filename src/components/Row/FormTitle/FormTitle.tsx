import React from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { withResizeDetector } from 'react-resize-detector'

import DeleteButton from './DeleteButton'
import AddButton from './AddButton'
import NavButtons from './NavButtons'
import ZoomToButton from '../../shared/ZoomToButton'
import FilterNumbers from '../../shared/FilterNumbers'
import Menu from '../../shared/Menu'
import HistoryButton from '../../shared/HistoryButton'
import constants from '../../../utils/constants'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'

const TitleContainer = styled.div`
  background-color: rgba(74, 20, 140, 0.1);
  flex-shrink: 0;
  display: flex;
  @media print {
    display: none !important;
  }
  height: ${constants.titleRowHeight}px;
  justify-content: space-between;
  padding 0 10px;
  svg, a, div {
    color: rgba(0,0,0,0.8) !important;
  }
`
const Title = styled.div`
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
  user-select: none;
`
const TitleSymbols = styled.div`
  display: flex;
  margin-top: auto;
  margin-bottom: auto;
`

const RowFormTitle = ({
  row,
  totalCount,
  filteredCount,
  width,
  project,
  table,
}) => {
  const title = labelFromLabeledTable({
    object: table,
    useLabels: project?.use_labels ?? 0,
    singular: true,
  })

  if (width < 520) {
    return (
      <TitleContainer>
        <Title>{title}</Title>
        <TitleSymbols>
          <NavButtons />
          <AddButton />
          <DeleteButton row={row} />
          <ZoomToButton bbox={row.bbox} geometryExists={!!row.geometry} />
          <Menu white={false}>
            <HistoryButton table="rows" id={row.id} asMenu />
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
      <Title>{title}</Title>
      <TitleSymbols>
        <NavButtons />
        <AddButton />
        <DeleteButton row={row} />
        <ZoomToButton bbox={row.bbox} geometryExists={!!row.geometry} />
        <HistoryButton />
        <FilterNumbers filteredCount={filteredCount} totalCount={totalCount} />
      </TitleSymbols>
    </TitleContainer>
  )
}

export default withResizeDetector(observer(RowFormTitle))
