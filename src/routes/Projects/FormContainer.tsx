import styled from 'styled-components'
import SimpleBar from 'simplebar-react'

const Container = styled.div`
  height: 100%;
`

const FormContainer = ({ children }) => (
  <SimpleBar style={{ maxHeight: '100%', height: '100%' }}>
    <Container>{children}</Container>
  </SimpleBar>
)

export default FormContainer
