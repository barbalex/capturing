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

  /**
   * Idea for preventing map from being re-initialized on tab changes
   * 1. Always use 3-tab structure
   * 2. if showTree is false: set size of outer pane to 0% and resizerStyle to { width: 0 }
   * 3. if showForm is false: set size of inner pane to 0% and resizerStyle to { width: 0 }
   * 4. if showForm is true and showMap is false: set size of inner pane to 100%
   * 5. when user changes widths: save lastWidth for each tab in store and use that when show is true?
   */
  let treePaneSize = '33%'
  let treeResizerWidth = 7
  if (!showTree) {
    treePaneSize = 0
    treeResizerWidth = 0
  } else if (!showForm && !showMap) {
    treePaneSize = '100%'
  }

  let formPaneSize = '50%'
  let formResizerWidth = 7
  if (!showForm) {
    formPaneSize = 0
    formResizerWidth = 0
  } else if (showForm && !showMap) {
    formPaneSize = '100%'
    formResizerWidth = 0
  }

  // console.log('Projects', {
  //   showTree,
  //   showMap,
  //   showForm,
  //   treePaneSize,
  //   formPaneSize,
  // })

  return (
    <Container ref={containerEl}>
      <StyledSplitPane
        split="vertical"
        size={treePaneSize}
        maxSize={-10}
        resizerStyle={{ width: treeResizerWidth }}
      >
        {showTree ? <Tree ref={treeEl} /> : <></>}
        <StyledSplitPane
          split="vertical"
          size={formPaneSize}
          maxSize={-10}
          resizerStyle={{ width: formResizerWidth }}
          //onDragFinished={onDragSplitter} // maybe set widths of parts in store, see apflora
        >
          {showForm ? <Outlet /> : <></>}
          <MapComponent />
        </StyledSplitPane>
      </StyledSplitPane>
    </Container>
  )
}

export default observer(ProjectsPage)
