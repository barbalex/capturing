import React, { useMemo } from 'react'
import styled from 'styled-components'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import ErrorBoundary from '../../shared/ErrorBoundary'
import Label from '../../shared/Label'
import { dexie, ProjectTileLayer } from '../../../dexieClient'

const LegendsContainer = styled.div`
  padding: 10px;
`

// = '99999999-9999-9999-9999-999999999999'
const MapLegends = () => {
  const { projectId } = useParams()

  const where = projectId
    ? // Beware: projectId can be undefined and dexie does not like that
      { deleted: 0, active: 1, project_id: projectId }
    : { deleted: 0, active: 1 }

  const tileLayers: TileLayerType[] =
    useLiveQuery(
      async () =>
        await dexie.project_tile_layers.where(where).reverse().sortBy('sort'),
      [projectId],
    ) ?? []
  /**
   * Ensure needed data exists:
   * - url_template has template
   * - wms has base-url and layers
   */
  const validTileLayers = tileLayers.filter((l) => {
    if (!l.type) return false
    if (l.type === 'url_template') {
      if (!l.url_template) return false
    } else {
      if (!l.wms_base_url) return false
      if (!l.wms_layers) return false
      if (!l._wmsLegends?.length) return false
    }
    return true
  })

  // console.log('MapLegends, validTileLayers:', validTileLayers)

  const legends = useMemo(() => {
    const _legends = []
    for (const row: ProjectTileLayer of validTileLayers) {
      for (const legend of row?._wmsLegends ?? []) {
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
    }
    return _legends
  }, [validTileLayers])

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}

export default MapLegends
