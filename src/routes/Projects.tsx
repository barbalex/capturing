import { useEffect, useContext, useRef, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import SplitPane from 'react-split-pane'
import { Outlet } from 'react-router-dom'

import StoreContext from '../storeContext'
import Login from '../components/Login'
import constants from '../utils/constants'
import nodesFromActiveNodeArray from '../utils/nodesFromActiveNodeArray'
import Tree from '../components/Tree'
import { supabase } from '../supabaseClient'
import MapComponent from '../components/Map'

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
    showTree,
    showForm,
    showMap,
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

  if (!session) return <Login />

  const treeWidth = singleColumnView ? 0 : `${treeWidthInPercentOfScreen}%`

  let tabsLength = 0
  if (showTree) tabsLength++
  if (showForm) tabsLength++
  if (showMap) tabsLength++

  // hide resizer when tree is hidden
  const resizerStyle = treeWidth === 0 ? { width: 0 } : {}

  if (tabsLength === 0) {
    // return WITH split pane
    // otherwise height is wrong
    // and opening / closing tabs is slow
    // add empty div to prevent split-pane from
    // missing a second div
    return (
      <Container ref={containerEl}>
        <StyledSplitPane
          split="vertical"
          size="100%"
          maxSize={-10}
          resizerStyle={resizerStyle}
        >
          <></>
          <></>
        </StyledSplitPane>
      </Container>
    )
  }
  if (tabsLength === 1) {
    // return WITH split pane
    // otherwise height is wrong
    // and opening / closing tabs is slow
    // add empty div to prevent split-pane from
    // missing a second div
    return (
      <Container ref={containerEl}>
        <StyledSplitPane
          split="vertical"
          size="100%"
          maxSize={-10}
          resizerStyle={resizerStyle}
        >
          {showTree && <Tree ref={treeEl} />}
          {showForm && <Outlet />}
          {showMap && <MapComponent />}
          <></>
        </StyledSplitPane>
      </Container>
    )
  }

  if (tabsLength === 2) {
    return (
      <Container ref={containerEl}>
        <StyledSplitPane
          split="vertical"
          size={treeWidth}
          maxSize={-10}
          resizerStyle={resizerStyle}
        >
          {showTree && <Tree ref={treeEl} />}
          {showForm && <Outlet />}
          {showMap && <MapComponent />}
        </StyledSplitPane>
      </Container>
    )
  }

  if (tabsLength === 3) {
    return (
      <Container ref={containerEl}>
        <StyledSplitPane
          split="vertical"
          size="33%"
          maxSize={-10}
          resizerStyle={resizerStyle}
        >
          {showTree && <Tree ref={treeEl} />}
          <StyledSplitPane
            split="vertical"
            size="50%"
            maxSize={-10}
            //onDragFinished={onDragSplitter} // maybe set widths of parts in store, see apflora
          >
            {showForm && <Outlet />}
            {showMap && <MapComponent />}
          </StyledSplitPane>
        </StyledSplitPane>
      </Container>
    )
  }
}

export default observer(ProjectsPage)
