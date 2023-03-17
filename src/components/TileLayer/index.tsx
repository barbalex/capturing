import styled from '@emotion/styled'

import FormTitle from './FormTitle'
import Form from './Form'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
`

const TileLayerComponent = ({ filter: showFilter }) => {
  const filter = 'TODO: was in store'

  if (!showFilter && filter.show) return null

  return (
    <Container showfilter={showFilter}>
      <FormTitle showFilter={showFilter} />
      <Form showFilter={showFilter} />
    </Container>
  )
}

export default TileLayerComponent
