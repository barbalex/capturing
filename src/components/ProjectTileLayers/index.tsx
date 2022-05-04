import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { Virtuoso } from 'react-virtuoso'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import storeContext from '../../storeContext'
import Row from './Row'
import ErrorBoundary from '../shared/ErrorBoundary'
import { dexie, ProjectTileLayer } from '../../dexieClient'
import Title from './Title'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
`
const RowsContainer = styled.div`
  height: 100%;
`

const ProjectTileLayersComponent = () => {
  const { projectId } = useParams()

  const store = useContext(storeContext)
  const { formHeight } = store

  const projectTileLayers: ProjectTileLayer[] =
    useLiveQuery(
      async () =>
        await dexie.project_tile_layers
          .where({ deleted: 0, project_id: projectId })
          .sortBy('label'),
      [projectId],
    ) ?? []

  return (
    <ErrorBoundary>
      <Container showfilter={false}>
        <Title />
        <RowsContainer>
          <Virtuoso
            height={formHeight}
            totalCount={projectTileLayers.length}
            itemContent={(index) => {
              const row = projectTileLayers[index]

              return <Row key={row.id} row={row} />
            }}
          />
        </RowsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(ProjectTileLayersComponent)
