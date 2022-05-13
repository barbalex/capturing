import styled from 'styled-components'

const Row = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr;
`
const Title = styled.h4`
  margin-top: 0;
  margin-bottom: 8px;
`
const Label = styled.div`
  color: rgba(0, 0, 0, 0.6);
`

const WMSPopup = ({ layersData }) => {
  return (
    <>
      {layersData.map((ld) => (
        <>
          <Title>{ld.label}</Title>
          {Object.entries(ld.properties)
            .filter(([key]) => key !== 'style')
            .map(([key, value]) => (
              <Row key={key}>
                <Label>{`${key}:`}</Label>
                <div>{value}</div>
              </Row>
            ))}
        </>
      ))}
    </>
  )
}

export default WMSPopup
