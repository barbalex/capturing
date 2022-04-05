import { useContext, useEffect } from 'react'
import styled from 'styled-components'
import { useResizeDetector } from 'react-resize-detector'
import { observer } from 'mobx-react-lite'

import storeContext from '../storeContext'
import constants from '../utils/constants'

const Container = styled.div`
  height: 0;
  width: 100%;
`

const Layout = () => {
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

  return <Container ref={resizeRef} />
}

export default observer(Layout)
