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

const RowsComponent = ({ level }) => {
  const params = useParams()
  const tableId = params[`tableId${level}`]
  const parentRowId = params[`rowId${level - 1}`]

  console.log('RowsList', { level, parentRowId })
  // TODO:
  // Check if row has field with table_rel
  // If so, check if that table is in higher up tableId(s)
  // If so, then that table's active row's id is the filter value for that field
  // Need to know if is rel to or from

  const data =
    useLiveQuery(async () => {
      const rows = await dexie.rows
        .where({ deleted: 0, table_id: tableId })
        .toArray()

      const rowsWithLabel = await rowsWithLabelFromRows(rows)

      const parentRow = parentRowId
        ? await dexie.rows.get(parentRowId)
        : undefined

      const fieldsRelatedTo = await dexie.fields
        .where(['deleted', 'table_id', 'table_rel'])
        .between([0, tableId, ''], [0, tableId, 'ZZZZZZZZZZZZZZ'])
        .toArray()
      const fieldsRelatedFrom = await dexie.fields
        .where({ deleted: 0, table_rel: tableId })
        .toArray()
      const tablesRelatedTo = {}
      for (const field of fieldsRelatedTo) {
        const tableRelatedTo = await dexie.ttables.get(field.table_rel)
        tablesRelatedTo[field.name] = tableRelatedTo
      }
      const tablesRelatedFrom = {}
      for (const field of fieldsRelatedFrom) {
        const tableRelatedFrom = await dexie.ttables.get(field.table_id)
        tablesRelatedFrom[field.name] = tableRelatedFrom
      }

      return { rowsWithLabel, tablesRelatedTo, tablesRelatedFrom, parentRow }
    }, [tableId, parentRowId]) ?? []

  let rowsWithLabel: RowsWithLabel[] = data?.rowsWithLabel ?? []
  const tablesRelatedTo = data?.tablesRelatedTo ?? []
  const tablesRelatedFrom = data?.tablesRelatedFrom ?? []
  const parentRow = data?.parentRow
  const tables = [
    ...(Object.entries(tablesRelatedTo).length
      ? Object.entries(tablesRelatedTo).map((o) => ({
          fieldName: o[0],
          table: o[1],
          type: 'to',
        }))
      : []),
    ...(Object.entries(tablesRelatedFrom).length
      ? Object.entries(tablesRelatedFrom).map((o) => ({
          fieldName: o[0],
          table: o[1],
          type: 'from',
        }))
      : []),
  ]
  for (const table of tables) {
    if (table.type === 'to') {
      rowsWithLabel = rowsWithLabel.filter(
        (row) => row.data?.[table.fieldName] === parentRowId,
      )
    }
    if (table.type === 'from') {
      rowsWithLabel = rowsWithLabel.filter(
        (row) => parentRow.data?.[table.fieldName] === row.id,
      )
    }
  }

  return (
    <ErrorBoundary>
      <Container showfilter={false}>
        <RowsTitle rowsWithLabel={rowsWithLabel} level={level} />
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
