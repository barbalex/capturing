import { useEffect, useContext, useRef, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import SplitPane from 'react-split-pane'
import { Routes, Route } from 'react-router-dom'

import StoreContext from '../storeContext'
import Login from '../components/Login'
import ErrorBoundary from '../components/shared/ErrorBoundary'
import constants from '../utils/constants'
import Projects from '../components/Projects'
import Project from '../components/Project'

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
  const {
    session,
    singleColumnView,
    treeWidthInPercentOfScreen,
    setTreeWidth,
    setFormWidth,
    setFormHeight,
  } = store

  console.log('Projects, subscriptionState:', store.subscriptionState)

  const containerEl = useRef(null)
  const treeEl = useRef(null)

  const setDimensions = useCallback(() => {
    console.log(
      'ProjectsPage, setDimensions, formWidth:',
      containerEl?.current?.clientWidth ?? standardWidth,
    )
    setTreeWidth(treeEl?.current?.clientWidth ?? standardWidth)
    setFormWidth(containerEl?.current?.clientWidth ?? standardWidth)
    setFormHeight(containerEl?.current?.clientHeight ?? standardWidth)
  }, [setFormHeight, setFormWidth, setTreeWidth])
  useEffect(() => {
    setDimensions()
  }, [setDimensions])

  useEffect(() => {
    document.title = 'Capturing: Projects'
  }, [])

  let treeWidth = singleColumnView ? 0 : `${treeWidthInPercentOfScreen}%`

  if (!session) return <Login />

  // hide resizer when tree is hidden
  const resizerStyle = treeWidth === 0 ? { width: 0 } : {}

  return (
    <ErrorBoundary>
      <Container ref={containerEl}>
        <StyledSplitPane
          split="vertical"
          size={treeWidth}
          maxSize={-10}
          resizerStyle={resizerStyle}
        >
          <div ref={treeEl}>tree</div>
          <Routes>
            <Route path="/" element={<Projects />} />
            <Route path=":projectId" element={<Project />} />
          </Routes>
        </StyledSplitPane>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(ProjectsPage)
