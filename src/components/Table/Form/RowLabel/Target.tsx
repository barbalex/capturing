import { Droppable, Draggable } from 'react-beautiful-dnd'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import styled from 'styled-components'

import { dexie, Field, ITable } from '../../../../dexieClient'

const Container = styled.div`
  margin: 0;
  border: 1px solid lightgrey;
  border-radius: 2px;
`
const Title = styled.h4`
margin 0;
padding: 8px;
`
const Target = styled.div`
  padding: 8px;
`

const ElementContainer = styled.div`
  padding: 8px;
  border: 1px solid lightgrey;
  margin-bottom: 4px;
  border-radius: 2px;
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
  rowState: ITable
}

const RowLabel = ({ rowLabel }: Props) => {
  const { tableId } = useParams()

  // rowLabel: array of {field: id, type: 'field'},{text, type: 'text'}
  const targetFieldIds: string[] = rowLabel
    .filter((el) => el.type === 'field')
    .map((el) => el.field)
  const targetFields: Field[] =
    useLiveQuery(
      async () =>
        await dexie.fields.where('id').anyOf(targetFieldIds).toArray(),
      [tableId, rowLabel],
    ) ?? []

  console.log('Target', {
    rowLabel,
    targetFieldIds,
    targetFields,
  })
  const targetElements = rowLabel.map((el) => ({
    type: el.type,
    field: el.field ? targetFields.find((f) => f.id === el.field) : undefined,
    text: el?.text,
  }))

  return (
    <Container>
      <Title>Target</Title>
      <Droppable droppableId="target">
        {(provided) => (
          <Target ref={provided.innerRef} {...provided.droppableProps}>
            {targetElements.map((el, index) => (
              <Draggable
                key={el.field?.id ?? el.text ?? index}
                draggableId={`${el.id}draggableTarget`}
                index={index}
              >
                {(provided) => (
                  <ElementContainer
                    key={el.field?.id ?? el.text ?? index}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                  >
                    {el.field?.name ?? el.text ?? 'neither fieldName nor text'}
                  </ElementContainer>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Target>
        )}
      </Droppable>
    </Container>
  )
}

export default RowLabel
