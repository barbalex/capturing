import styled from 'styled-components'

const Row = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr;
  font-size: x-small !important;
`
const Title = styled.h4`
  margin-top: 0;
  margin-bottom: 8px;
  &:not(:first-of-type) {
    margin-top: 8px;
  }
`
const Label = styled.div`
  color: rgba(0, 0, 0, 0.6);
`

const WMSPopup = ({ layersData }) => {
  console.log({ layersData })
  return (
    <>
      {layersData.map((ld) => (
        <>
          <Title>{ld.label}</Title>
          {ld.properties.map((props) => (
            <Row key={props[0]}>
              <Label>{`${props[0]}:`}</Label>
              <div>{props[1]}</div>
            </Row>
          ))}
        </>
      ))}
    </>
  )
}

export default WMSPopup
