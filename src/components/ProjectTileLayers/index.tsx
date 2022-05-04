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
import { supabase } from '../../supabaseClient'
import TitleComponent from './Title'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
`
const Title = styled.div`
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
`
const RowsContainer = styled.div`
  height: 100%;
`

const ProjectTileLayersComponent = () => {
  const session = supabase.auth.session()
  const { projectId } = useParams()

  const store = useContext(storeContext)
  const { formHeight } = store

  const data = useLiveQuery(async () => {
    const [projectTileLayers] = await Promise.all([
      dexie.project_tile_layers
        .where({ deleted: 0, project_id: projectId })
        .sortBy('label'),
    ])

    return {
      projectTileLayers,
    }
  }, [projectId, session?.user?.email])
  const projectTileLayers: ProjectTileLayer[] = data?.projectTileLayers ?? []

  return (
    <ErrorBoundary>
      <Container showfilter={false}>
        <TitleComponent />
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
