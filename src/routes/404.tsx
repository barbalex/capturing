import React from 'react'
import styled from '@emotion/styled'

const StyledPen = styled(Pen)`
  font-size: 10em;
`
const Container = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

import { ReactComponent as Pen } from '../images/pen.svg'

const FourOhFour = (): React.FC => {
  return (
    <Container>
      <StyledPen /> <p>sorry, nothing here &#128546;</p>
    </Container>
  )
}

export default FourOhFour
