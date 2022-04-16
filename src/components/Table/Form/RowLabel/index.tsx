import { useCallback, useMemo } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import styled from 'styled-components'

import { dexie, Field, Project, Table, ITable } from '../../../../dexieClient'
import FieldList from './FieldList'
import Target from './Target'

const Container = styled.div`
  margin: 0;
  border: 1px solid lightgrey;
  border-radius: 2px;
  padding: 8px;
`
const InnerContainer = styled.div`
  display: flex;
  justify-content: space-around;
`
const Title = styled.h4`
  margin 0;
`

/**
 * Have two versions:
 * 1. editing
 *    - (horizontal?) list of draggable fields
 *    - text field element to drag between field elements and input some text
 *    - drop area, horizontally sortable
 *      edit creates array of: {field: field_id, text: 'field', index: 1}
 *      or
 *         have a table 'table_row_label_parts' with fields: table_id, sort, type, value
 *         and in class Table a get function to fetch the table's row label or use https://github.com/ignasbernotas/dexie-relationships
 *         No, because: new table needs to be policied and synced. Much easier to have a jsonb field in already synced table
 * 2. presentation: only the drop area
 * 3. remind user to first define the fields
 */
type Props = {
  project: Project
  table: Table
  rowState: ITable
  updateOnServer: () => void
}

const RowLabel = ({ project, table, rowState, updateOnServer }: Props) => {
  const { tableId } = useParams()

  const fields: Field[] = useLiveQuery(
    async () =>
      await dexie.fields.where({ table_id: tableId, deleted: 0 }).toArray(),
    [tableId],
  )

  // array of {field: id, type: 'field'},{text, type: 'text'}
  const rowLabel = useMemo(() => table.row_label ?? [], [table.row_label])

  const fieldsForFieldList = (fields ?? []).filter(
    (f) =>
      !rowLabel
        .filter((l) => l.type === 'field')
        .map((l) => l.field)
        .includes(f.id),
  )

  console.log('RowLabel', {
    project,
    table,
    rowLabel,
  })

  // TODO: on with https://egghead.io/lessons/react-persist-list-reordering-with-react-beautiful-dnd-using-the-ondragend-callback
  const onDragEnd = useCallback(
    (result) => {
      // TODO:
      console.log('onDragEnd, result:', result)
      const { destination, source } = result
      if (
        destination.droppableId === 'target' &&
        source.droppableId === 'fieldList'
      ) {
        // want to add this to rowLabel at this index
        const field: Field = fields[source.index]
        console.log('onDragEnd, field:', { field, rowState: rowState.current })

        const newRow = {
          ...rowState.current,
          row_label: [
            ...rowLabel.slice(0, destination.index),
            {
              field: field.id,
              type: 'field',
              index: destination.index,
            },
            ...rowLabel.slice(destination.index),
          ],
        }
        rowState.current = newRow
        dexie.ttables.put(newRow)
      }
      if (
        destination.droppableId === 'fieldList' &&
        source.droppableId === 'target'
      ) {
        // want to remove this from the rowLabel at this index
        const clonedRowLabel = [...rowLabel]
        clonedRowLabel.splice(source.index, 1)

        const newRow = {
          ...rowState.current,
          row_label: clonedRowLabel.length ? clonedRowLabel : null,
        }
        rowState.current = newRow
        dexie.ttables.put(newRow)
      }
    },
    [fields, rowLabel, rowState],
  )

  return (
    <Container
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          // focus left the container
          // https://github.com/facebook/react/issues/6410#issuecomment-671915381
          updateOnServer()
        }
      }}
    >
      <Title>Datensatz-Beschriftung</Title>
      <InnerContainer>
        <DragDropContext onDragEnd={onDragEnd}>
          <Target rowLabel={rowLabel} />
          <FieldList project={project} fields={fieldsForFieldList} />
        </DragDropContext>
      </InnerContainer>
    </Container>
  )
}

export default RowLabel
