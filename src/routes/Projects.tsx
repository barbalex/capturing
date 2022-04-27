import { useEffect, useContext, useRef, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import SplitPane from 'react-split-pane'
import { Outlet } from 'react-router-dom'

import StoreContext from '../storeContext'
import Login from '../components/Login'
import ErrorBoundary from '../components/shared/ErrorBoundary'
import constants from '../utils/constants'
import nodesFromActiveNodeArray from '../utils/nodesFromActiveNodeArray'
import Tree from '../components/Tree'
import { supabase } from '../supabaseClient'

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
const Container = styled.div`
  min-height: calc(100vh - ${constants.appBarHeight}px);
  position: relative;
`

const standardWidth = 500

const ProjectsPage = () => {
  const store = useContext(StoreContext)
  const session = supabase.auth.session()
  const {
    singleColumnView,
    treeWidthInPercentOfScreen,
    setTreeWidth,
    setFormWidth,
    setFormHeight,
    setNodes,
    activeNodeArray,
  } = store

  // console.log('Projects, subscriptionState:', store.subscriptionState)

  const containerEl = useRef(null)
  const treeEl = useRef(null)

  const setDimensions = useCallback(() => {
    setTreeWidth(treeEl?.current?.clientWidth ?? standardWidth)
    setFormWidth(containerEl?.current?.clientWidth ?? standardWidth)
    setFormHeight(containerEl?.current?.clientHeight ?? standardWidth)
  }, [setFormHeight, setFormWidth, setTreeWidth])
  // re-calc dimensions every time containerEl changes
  useEffect(() => {
    setDimensions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setDimensions, containerEl?.current])

  useEffect(() => {
    document.title = 'Capturing: Projects'
  }, [])

  // on first render set nodes
  // DO NOT add activeNodeArray to useEffet's dependency array or
  // it will not be possible to open multiple branches in tree
  // as nodes is overwritten every time activeNodeArray changes
  // TODO: is this needed?
  useEffect(() => {
    // console.log('Project setting initial open nodes', {
    //   activeNodeArray: activeNodeArray.slice(),
    //   newOpenNodes: nodesFromActiveNodeArray(activeNodeArray),
    // })
    setNodes(nodesFromActiveNodeArray(activeNodeArray))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const treeWidth = singleColumnView ? 0 : `${treeWidthInPercentOfScreen}%`

  if (!session) return <Login />

  // hide resizer when tree is hidden
  const resizerStyle = treeWidth === 0 ? { width: 0 } : {}

  // TODO: in editing mode, render tree with fields
  return (
    <ErrorBoundary>
      <Container ref={containerEl}>
        <StyledSplitPane
          split="vertical"
          size={treeWidth}
          maxSize={-10}
          resizerStyle={resizerStyle}
        >
          <Tree ref={treeEl} />
          <Outlet />
        </StyledSplitPane>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(ProjectsPage)
