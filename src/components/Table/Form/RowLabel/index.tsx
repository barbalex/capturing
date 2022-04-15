import { useCallback, useMemo } from 'react'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import styled from 'styled-components'

import { dexie, Field, Project, Table, ITable } from '../../../../dexieClient'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'
import FieldList from './FieldList'

const Container = styled.div`
  margin: 0;
  border: 1px solid lightgrey;
  border-radius: 2px;
  padding: 8px;
`
const Title = styled.h4`
  margin 0;
`
const Target = styled.div`
  padding: 8px;
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
}

const RowLabel = ({ project, table, rowState }: Props) => {
  const { tableId } = useParams()

  const fields: Field[] = useLiveQuery(
    async () =>
      await dexie.fields.where({ table_id: tableId, deleted: 0 }).toArray(),
    [tableId],
  )

  // array of {field: id, type: 'field'},{text, type: 'text'}
  const rowLabel = useMemo(() => table.row_label ?? [], [table.row_label])
  const targetFieldIds: string[] = rowLabel
    .filter((el) => el.type === 'field')
    .map((el) => el.field)
  const targetFields: Field[] =
    useLiveQuery(
      async () =>
        await dexie.fields.where('id').anyOf(targetFieldIds).toArray(),
      [tableId, table.row_label],
    ) ?? []

  console.log('RowLabel', {
    project,
    table,
    rowLabel,
    targetFieldIds,
    targetFields,
  })
  const targetElements = rowLabel.map((el) => ({
    type: el.type,
    field: el.field ? targetFields.find((f) => f.id === el.field) : undefined,
    text: el?.text,
  }))

  console.log('RowLabel', {
    targetElements,
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
            },
            ...rowLabel.slice(destination.index),
          ],
        }
        rowState.current = newRow
        console.log('onDragEnd, newRow:', newRow)
        dexie.ttables.put(newRow)
      }
    },
    [fields, rowLabel, rowState],
  )

  return (
    <Container>
      <DragDropContext onDragEnd={onDragEnd}>
        <Title>Datensatz-Beschriftung</Title>
        <Droppable droppableId="target">
          {(provided) => (
            <Target ref={provided.innerRef} {...provided.droppableProps}>
              <p>target</p>
              {targetElements.map((el, index) => (
                <div key={el.field?.id ?? el.text ?? index}>
                  {el.field?.name ?? el.text ?? 'neither fieldName nor text'}
                </div>
              ))}
              {provided.placeholder}
            </Target>
          )}
        </Droppable>
        <FieldList project={project} fields={fields} />
      </DragDropContext>
    </Container>
  )
}

export default RowLabel
