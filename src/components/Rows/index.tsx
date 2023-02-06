import styled from '@emotion/styled'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import RowComponent from './Row'
import RowsTitle from './RowsTitle'
import ErrorBoundary from '../shared/ErrorBoundary'
import rowsWithLabelFromRows from '../../utils/rowsWithLabelFromRows'
import { dexie, Row } from '../../dexieClient'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
`
const RowsContainer = styled.div`
  height: 100%;
  overflow: auto;
`

type RowsWithLabel = Row & { label: string }

const RowsComponent = () => {
  const { tableId, tableId2 } = useParams()

  // console.log('RowsList rendering')

  const rowsWithLabel: RowsWithLabel[] =
    useLiveQuery(async () => {
      const rows = await dexie.rows
        .where({ deleted: 0, table_id: tableId2 ?? tableId })
        .toArray()

      return await rowsWithLabelFromRows(rows)
    }, [tableId]) ?? []

  return (
    <ErrorBoundary>
      <Container showfilter={false}>
        <RowsTitle rowsWithLabel={rowsWithLabel} />
        <RowsContainer>
          {rowsWithLabel.map((row) => (
            <RowComponent key={row.id} row={row} />
          ))}
        </RowsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default RowsComponent
