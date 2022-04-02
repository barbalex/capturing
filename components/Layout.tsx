import { useContext, useEffect } from 'react'
import styled from 'styled-components'
import { useResizeDetector } from 'react-resize-detector'
import { observer } from 'mobx-react-lite'

import storeContext from '../storeContext'

const Container = styled.div`
  height: 100%;
  width: 100%;
`

const Layout = ({ children }) => {
  const { width, ref: resizeRef } = useResizeDetector()

  const store = useContext(storeContext)
  const { singleColumnView, setSingleColumnView } = store

  useEffect(() => {
    if (width > constants?.tree?.minimalWindowWidth && singleColumnView) {
      setSingleColumnView(false)
    }
    if (width < constants?.tree?.minimalWindowWidth && !singleColumnView) {
      setSingleColumnView(true)
    }
  }, [setSingleColumnView, singleColumnView, width])

  return <Container ref={resizeRef}>{children}</Container>
}

export default observer(Layout)
