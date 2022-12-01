import React, { useContext, useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import SplitPane from 'react-split-pane'
import { useParams } from 'react-router-dom'
import { dexie, Row } from '../../dexieClient'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../storeContext'
import ErrorBoundary from '../shared/ErrorBoundary'
import Spinner from '../shared/Spinner'
import FormTitle from './FormTitle'
import Form from './Form'
import RowAside from './RowAside'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
`
const SplitPaneContainer = styled.div`
  height: 100%;
  position: relative;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
`
const StyledSplitPane = styled(SplitPane)`
  .Resizer {
    background: rgba(74, 20, 140, 0.1);
    opacity: 1;
    z-index: 1;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    width: 7px;
    cursor: col-resize;
  }
  .Resizer:hover {
    -webkit-transition: all 0.5s ease;
    transition: all 0.5s ease;
    background-color: #fff59d !important;
  }
  .Resizer.disabled {
    cursor: not-allowed;
  }
  .Resizer.disabled:hover {
    border-color: transparent;
  }
  .Pane {
    overflow: hidden;
  }
`

const RowComponent = ({ filter: showFilter }) => {
  const params = useParams()
  const { rowId } = params
  // const url = params['*']
  // const showHistory = url?.endsWith('history')
  const store = useContext(StoreContext)
  const { online } = store
  const filter = 'TODO: was in store'

  // console.log('RowComponent', { rowId })

  const row: Row = useLiveQuery(
    async () => await dexie.rows.get(rowId),
    [rowId],
  )

  const [showHistory, setShowHistory] = useState(false)
  // console.log('RowForm rendering, row:', row)

  const [activeConflict, setActiveConflict] = useState(null)
  // ensure that activeConflict is reset
  // when changing dataset
  useEffect(() => {
    if (activeConflict) {
      setActiveConflict(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowId])

  if (!row) return <Spinner />
  if (!showFilter && filter.show) return null

  const paneIsSplit = online && (activeConflict || showHistory)

  const firstPaneWidth = paneIsSplit ? '50%' : '100%'
  // hide resizer when tree is hidden
  const resizerStyle = !paneIsSplit ? { width: 0 } : {}

  return (
    <ErrorBoundary>
      <Container showfilter={showFilter}>
        <FormTitle
          row={row}
          showFilter={showFilter}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
        />
        <SplitPaneContainer>
          <StyledSplitPane
            split="vertical"
            size={firstPaneWidth}
            maxSize={-10}
            resizerStyle={resizerStyle}
          >
            <Form
              showFilter={showFilter}
              id={rowId}
              row={row}
              activeConflict={activeConflict}
              setActiveConflict={setActiveConflict}
            />
            <RowAside
              row={row}
              activeConflict={activeConflict}
              setActiveConflict={setActiveConflict}
              showHistory={showHistory}
              setShowHistory={setShowHistory}
            />
          </StyledSplitPane>
        </SplitPaneContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(RowComponent)
