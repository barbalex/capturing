import styled from '@emotion/styled'

import LegendsControl from './LegendsControl'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

const OwnControls = () => {
  return (
    <Container>
      <LegendsControl />
    </Container>
  )
}

export default OwnControls
