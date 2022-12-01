import styled from '@emotion/styled'

import Header from './Header'

const Container = styled.div`
  height: 100%;
  width: 100%;
`

const Layout = ({ children }) => {
  // console.log('Layout rendering')

  return (
    <Container>
      <Header />
      {children}
    </Container>
  )
}

export default Layout
