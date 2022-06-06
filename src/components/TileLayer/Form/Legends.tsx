import React, { useEffect, useState } from 'react'
import axios from 'redaxios'
import styled from 'styled-components'

import ErrorBoundary from '../../shared/ErrorBoundary'
import Label from '../../shared/Label'
import constants from '../../../utils/constants'
import { dexie } from '../../../dexieClient' 

const Container = styled.div`
  margin: 15px -10px 10px -10px;
`
const TitleRow = styled.div`
  background-color: rgba(248, 243, 254, 1);
  flex-shrink: 0;
  display: flex;
  height: ${constants.titleRowHeight}px;
  justify-content: space-between;
  padding: 0 10px;
  cursor: pointer;
  user-select: none;
  position: sticky;
  top: -10px;
  z-index: 1;
  &:first-of-type {
    margin-top: -10px;
  }
`
const Title = styled.div`
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
`
const LegendsContainer = styled.div`
  padding: 10px;
`

// = '99999999-9999-9999-9999-999999999999'
const TileLayerFormLegends = ({ row }) => {
  const [legends, setLegends] = useState()
  useEffect(() => {
    // get legends from row
    const _legends = []
    for (const legend of row._wmsLegends ?? []) {
      let objectUrl
      try {
        objectUrl = URL.createObjectURL(
          new Blob([legend[1]], { type: 'image/png' }),
        )
      } catch (error) {
        return console.error(
          `error creating objectUrl for legend for layer '${legend[0]}'`,
          error,
        )
      }
      if (objectUrl) _legends.push([legend[0], objectUrl])
    }
    setLegends(_legends)
  }, [row])

  if (!legends) return null
  if (!legends.length) return null

  return (
    <ErrorBoundary>
      <Container>
        <TitleRow>
          <Title>Legenden</Title>
        </TitleRow>
        <LegendsContainer>
          {(legends ?? []).map(([title, blob]) => {
            return (
              <div key={title}>
                <Label label={title} />
                {!!blob && <img src={blob} />}
              </div>
            )
          })}
        </LegendsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default TileLayerFormLegends
