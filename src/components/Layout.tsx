import styled from '@emotion/styled'
import { Outlet } from 'react-router-dom'

import Header from './Header'

const Container = styled.div`
  height: 100%;
  width: 100%;
`

const Layout = (): React.FC => (
  <Container>
    <Header />
    <Outlet />
  </Container>
)

export default Layout
