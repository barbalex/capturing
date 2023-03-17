import { useEffect, useContext, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import SplitPane from 'react-split-pane'
import { Outlet } from 'react-router-dom'
import Split from 'react-split'

import StoreContext from '../storeContext'
import Login from '../components/Login'
import constants from '../utils/constants'
import Tree from '../components/Tree'
import MapComponent from '../components/Map'
import { IStore } from '../store'

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
  .gutter {
    height: calc(100vh - ${constants.appBarHeight}px);
  }
`
const Container = styled.div`
  min-height: calc(100vh - ${constants.appBarHeight}px);
  position: relative;
`

/**
 * TODO:
 * try using split (https://github.com/nathancahill/split/tree/master/packages/react-split)
 * to:
 * - animate changeds of columns
 */

const ProjectsPage = () => {
  const store: IStore = useContext(StoreContext)
  const { showTree, showForm, showMap, mapInitiated, session } = store

  // console.log('Projects, mapInitiated:', mapInitiated)

  const containerEl = useRef(null)
  const treeEl = useRef(null)

  useEffect(() => {
    document.title = 'Erfassen: Projekte'
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

  console.log('Projects', {
    showTree,
    showMap,
    showForm,
    treePaneSize,
    formPaneSize,
    mapInitiated,
  })

  return (
    <Container ref={containerEl}>
      <Split
        direction="horizontal"
        sizes={[33.333, 33.333, 33.333]}
        gutterSize={5}
        style={{ height: 'calc(100vh - 64px)', display: 'flex' }}
      >
        <>{showTree ? <Tree ref={treeEl} /> : <></>}</>
        <>{showForm ? <Outlet /> : <></>}</>
        <>{mapInitiated ? <MapComponent /> : <></>}</>
      </Split>
    </Container>
  )
}

export default observer(ProjectsPage)
