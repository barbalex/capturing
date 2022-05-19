import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { Virtuoso } from 'react-virtuoso'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'
import { Session } from '@supabase/supabase-js'

import storeContext from '../../storeContext'
import Row from './Row'
import ErrorBoundary from '../shared/ErrorBoundary'
import { dexie, Project } from '../../dexieClient'
import { supabase } from '../../supabaseClient'
import HeightPreservingItem from '../shared/HeightPreservingItem'
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

const FieldsComponent = () => {
  const session: Session = supabase.auth.session()
  const { projectId, tableId } = useParams()
  const store = useContext(storeContext)
  const { formHeight } = store

  // console.log('FieldsList rendering')

  const data = useLiveQuery(async () => {
    const [fields, project] = await Promise.all([
      dexie.fields.where({ deleted: 0, table_id: tableId }).sortBy('sort'),
      dexie.projects.get(projectId),
    ])

    return {
      fields,
      project,
    }
  }, [tableId, projectId, session?.user?.email])

  const project: Project = data?.project
  const fields: Fields[] = data?.fields ?? []

  return (
    <ErrorBoundary>
      <Container showfilter={false}>
        <Title />
        <RowsContainer>
          <Virtuoso
            //initialTopMostItemIndex={initialTopMostIndex}
            height={formHeight}
            totalCount={fields.length}
            itemContent={(index) => {
              const row = fields[index]

              return <Row key={row.id} row={row} project={project} />
            }}
          />
        </RowsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(FieldsComponent)
