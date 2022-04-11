import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import { dexie, Table } from '../../dexieClient'
import { useLiveQuery } from 'dexie-react-hooks'

import ErrorBoundary from '../shared/ErrorBoundary'
import Spinner from '../shared/Spinner'
import FormTitle from './FormTitle'
import Form from './Form'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
`

const TableComponent = ({ filter: showFilter }) => {
  const { tableId } = useParams()
  const filter = 'TODO: was in store'

  const row: Table = useLiveQuery(
    async () => await dexie.ttables.get(tableId),
    [tableId],
  )

  // console.log('Project rendering row:', { row, projectId })

  if (!row) return <Spinner />
  if (!showFilter && filter.show) return null

  return (
    <ErrorBoundary>
      <Container showfilter={showFilter}>
        <FormTitle row={row} showFilter={showFilter} />
        <Form showFilter={showFilter} id={tableId} row={row} />
      </Container>
    </ErrorBoundary>
  )
}

export default observer(TableComponent)
