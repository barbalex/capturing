import React, { useEffect, useState } from 'react'
import axios from 'redaxios'
import styled from 'styled-components'

import ErrorBoundary from '../../shared/ErrorBoundary'
import Label from '../../shared/Label'
import constants from '../../../utils/constants'

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
const ProjectTileLayerFormLegends = ({ legendUrls }) => {
  const [legends, setLegends] = useState()
  useEffect(() => {
    const run = async () => {
      const legends = []
      for (const lUrl of legendUrls) {
        let res
        try {
          res = await axios.get(lUrl.url, {
            responseType: 'blob',
          })
        } catch (error) {
          // error can also be caused by timeout
          console.log(`error fetching legend for layer '${lUrl.title}':`, error)
          return false
        }
        let objectUrl
        try {
          objectUrl = URL.createObjectURL(
            new Blob([res.data], { type: 'image/png' }),
          )
        } catch (error) {
          return console.log(
            `error creating objectUrl for legend for layer '${lUrl.title}'`,
            error,
          )
        }
        if (objectUrl) legends.push([lUrl.title, objectUrl])
      }

      setLegends(legends)
    }
    run()
  }, [legendUrls])

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

export default ProjectTileLayerFormLegends
