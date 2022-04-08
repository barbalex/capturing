import { useEffect, useState, useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import SplitPane from 'react-split-pane'

import StoreContext from '../storeContext'
import { supabase } from '../supabaseClient'
import Login from '../components/Login'
import { field_types } from '../types'
import ErrorBoundary from '../components/shared/ErrorBoundary'
import constants from '../utils/constants'

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

const Projects = () => {
  const store = useContext(StoreContext)
  const { session, singleColumnView, treeWidthInPercentOfScreen } = store

  console.log('Projects, subscriptionState:', store.subscriptionState)

  useEffect(() => {
    document.title = 'Capturing: Projects'
  }, [])

  const [projects, setProjects] = useState([])
  useEffect(() => {
    const run = async () => {
      const { data } = await supabase
        .from<field_types>('field_types')
        .select('*')
      setProjects(data)
    }
    run()
  }, [])

  let treeWidth = singleColumnView ? 0 : `${treeWidthInPercentOfScreen}%`

  if (!session) return <Login />

  // hide resizer when tree is hidden
  const resizerStyle = treeWidth === 0 ? { width: 0 } : {}

  return (
    <ErrorBoundary>
      <Container>
        <StyledSplitPane
          split="vertical"
          size={treeWidth}
          maxSize={-10}
          resizerStyle={resizerStyle}
        >
          <div>tree</div>
          <div>project</div>
        </StyledSplitPane>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(Projects)
