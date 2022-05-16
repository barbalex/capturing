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
const ProjectTileLayerFormLegends = ({ legendUrls, row }) => {
  console.log('ProjectTileLayerFormLegends', { legendUrls, row })
  useEffect(() => {
    const run = async () => {
      // only fetch if not done yet
      if (row?.wms_legends?.length) return
      if (!legendUrls) return

      const _legendBlobs = []
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
        // console.log('Legends, res.data:', res.data)
        if (res.data) _legendBlobs.push([lUrl.title, res.data])
      }

      if (_legendBlobs.length) {
        // add legends into row to reduce network activity and make them offline available
        dexie.project_tile_layers.update(row.id, { wms_legends: _legendBlobs })
      }
    }
    run()
  }, [legendUrls, row])

  const [legends, setLegends] = useState()
  useEffect(() => {
    // get legends from row
    const _legends = []
    for (const legend of row.wms_legends ?? []) {
      let objectUrl
      try {
        objectUrl = URL.createObjectURL(
          new Blob([legend[1]], { type: 'image/png' }),
        )
      } catch (error) {
        return console.log(
          `error creating objectUrl for legend for layer '${legend[0]}'`,
          error,
        )
      }
      if (objectUrl) _legends.push([legend[0], objectUrl])
    }
    setLegends(_legends)
  }, [row])

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
