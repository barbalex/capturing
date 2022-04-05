import { useContext, useEffect } from 'react'
import styled from 'styled-components'
import { useResizeDetector } from 'react-resize-detector'
import { observer } from 'mobx-react-lite'
import { useSearchParams, useNavigate } from 'react-router-dom'

import storeContext from '../storeContext'
import Header from './Header'
import constants from '../utils/constants'
import ResetPassword from './ResetPassword'

const Container = styled.div`
  height: 100%;
  width: 100%;
`

const Layout = ({ children }) => {
  const { width, ref: resizeRef } = useResizeDetector()

  const navigate = useNavigate()
  // enable navigating in store > set this as store value
  // (can't be passed when creating store yet)
  useEffect(() => {
    setNavigate(navigate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // detect type = recovery to open reset password modal
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams()
  const resetPassword = searchParams.get('type') === 'recovery'

  const store = useContext(storeContext)
  const { singleColumnView, setSingleColumnView, setNavigate } = store

  console.log('Layout rendering')

  useEffect(() => {
    if (width > constants?.tree?.minimalWindowWidth && singleColumnView) {
      setSingleColumnView(false)
    }
    if (width < constants?.tree?.minimalWindowWidth && !singleColumnView) {
      setSingleColumnView(true)
    }
  }, [setSingleColumnView, singleColumnView, width])

  return (
    <Container ref={resizeRef}>
      <Header />
      {resetPassword && <ResetPassword />}
      {children}
    </Container>
  )
}

export default observer(Layout)
