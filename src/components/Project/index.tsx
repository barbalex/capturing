import styled from 'styled-components'
import ErrorBoundary from '../shared/ErrorBoundary'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
`

const Project = () => {
  return (
    <ErrorBoundary>
      <Container showfilter={false}>project form</Container>
    </ErrorBoundary>
  )
}

export default Project
