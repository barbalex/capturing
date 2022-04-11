import styled from 'styled-components'
import SimpleBar from 'simplebar-react'

const StyledSimplebar = styled(SimpleBar)`
  .simplebar-content {
    height: 100%;
  }
`
const Container = styled.div`
  height: 100%;
`

const FormContainer = ({ children }) => (
  <StyledSimplebar style={{ maxHeight: '100%', height: '100%' }}>
    <Container>{children}</Container>
  </StyledSimplebar>
)

export default FormContainer
