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
    //singleColumnView,
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
    document.title = 'Erfassen: Projekte'
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
   * 2. If showTree is false: set size of outer pane to 0 and resizerStyle to { width: 0 }
   *    unload tree to reduce rendering work
   *    (but render empty braces to make react-split-pane happy)
   * 3. If showForm is false: set size of inner pane to 0 and resizerStyle to { width: 0 }
   *    unload form to reduce rendering work
   *    (but render empty braces to make react-split-pane happy)
   * 4. If showForm is true and showMap is false: set size of inner pane to 100%
   * 5. Tree is NEVER unloaded to prevent it from being re-initialized
   * 6. When user changes widths: save lastWidth for each tab in store and use that when show is true?
   */
  let tabsLength = 0
  if (showTree) tabsLength++
  if (showForm) tabsLength++
  if (showMap) tabsLength++

  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth
  const resizerWidth = 5
  // let treePaneSize = '33%'
  let treePaneSize = (width - (tabsLength - 1) * resizerWidth) / 3
  let treeResizerWidth = resizerWidth
  if (!showTree) {
    treePaneSize = 0
    treeResizerWidth = 0
  } else if (!showForm && !showMap) {
    treePaneSize = '100%'
  }

  let formTabsLength = 0
  if (showForm) formTabsLength++
  if (showMap) formTabsLength++
  let formPaneSize =
    (width -
      treePaneSize -
      treeResizerWidth -
      (formTabsLength - 1) * resizerWidth) /
    2

  // let formPaneSize = '50%'
  let formResizerWidth = resizerWidth
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
        >
          {showForm ? <Outlet /> : <></>}
          <MapComponent />
        </StyledSplitPane>
      </StyledSplitPane>
    </Container>
  )
}

export default observer(ProjectsPage)
