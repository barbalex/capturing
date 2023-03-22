import { useEffect, useContext, useRef, PropsWithChildren } from 'react'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import SplitPane from 'react-split-pane'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

import StoreContext from '../storeContext'
import Login from '../components/Login'
import constants from '../utils/constants'
import Tree from '../components/Tree'
import MapComponent from '../components/Map'
import { IStore } from '../store'

export const StyledSplitPane = styled(SplitPane)`
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
const StyledMotionDiv = styled(motion.div)`
  height: 100%;
`

export const resizerWidth = 5

const PageLayout = ({ children }): PropsWithChildren => children

const transition1 = { duration: 0.05 }
const transition2 = { duration: 0.4 }
const initial = {
  next: { x: '100%', opacity: 1 },
  previous: { x: '-100%', opacity: 1 },
  down: { y: '100%', opacity: 1 },
  up: { y: '-100%', opacity: 1 },
  in: {},
}
const animate = {
  next: { x: 0, transition: transition2, opacity: 1 },
  previous: { x: 0, transition: transition2, opacity: 1 },
  down: {
    y: 0,
    transition: transition2,
    opacity: 1,
  },
  up: {
    y: 0,
    transition: transition2,
    opacity: 1,
  },
  in: {},
}
/**
 * exit animation is one behind when direction changes
 * that is hideous
 * Reason: exit transition is set on component mount <> next direction is known later...
 */
// const exit = {
//   next: {
//     x: '-100%',
//     transition: transition1,
//   },
//   previous: {
//     x: '100%',
//     transition: transition1,
//   },
//   down: {
//     y: '-100%',
//     transition: transition1,
//   },
//   up: {
//     y: '100%',
//     transition: transition1,
//   },
// }

/**
 * TODO:
 * try using split (https://github.com/nathancahill/split/tree/master/packages/react-split)
 * to:
 * - animate changeds of columns
 */

const ProjectsPage = (): React.FC => {
  const store: IStore = useContext(StoreContext)
  const {
    showTree,
    showForm,
    showMap,
    mapInitiated,
    horizontalNavIds,
    activeNodeArray,
    previousActiveNodeArray,
    session,
    sessionCounter,
  } = store

  // console.log('Projects, mapInitiated:', mapInitiated)

  const containerEl = useRef(null)

  useEffect(() => {
    document.title = 'Erfassen: Projekte'
  }, [])

  // console.log('Projects, session:', { session, sessionCounter })

  if (!session || sessionCounter === 0) return <Login />

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

  const prevLastNode = previousActiveNodeArray.at(-1)
  const newLastNode = activeNodeArray.at(-1)

  const navDirection =
    previousActiveNodeArray.length > activeNodeArray.length
      ? 'up'
      : previousActiveNodeArray.length < activeNodeArray.length
      ? 'down'
      : horizontalNavIds.indexOf(prevLastNode) <
        horizontalNavIds.indexOf(newLastNode)
      ? 'next'
      : 'previous'

  return (
    <Container ref={containerEl}>
      <StyledSplitPane
        split="vertical"
        size={treePaneSize}
        maxSize={-10}
        resizerStyle={{ width: treeResizerWidth }}
      >
        {showTree ? <Tree /> : <></>}
        <StyledSplitPane
          split="vertical"
          size={formPaneSize}
          maxSize={-10}
          resizerStyle={{ width: formResizerWidth }}
        >
          <AnimatePresence initial={false}>
            {showForm ? (
              <PageLayout key={activeNodeArray.slice().join('/')}>
                <StyledMotionDiv
                  initial={initial[navDirection]}
                  animate={animate[navDirection]}
                >
                  <Outlet />
                </StyledMotionDiv>
              </PageLayout>
            ) : (
              <></>
            )}
          </AnimatePresence>
          {mapInitiated ? <MapComponent /> : <></>}
        </StyledSplitPane>
      </StyledSplitPane>
    </Container>
  )
}

export default observer(ProjectsPage)
