import { Droppable, Draggable } from 'react-beautiful-dnd'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import styled from 'styled-components'

import { dexie, Field } from '../../../../dexieClient'
import BetweenCharacters from './BetweenCharacters'

const Container = styled.div`
  margin: 0;
  margin-right: 8px;
  outline: 1px dotted lightgrey;
  border-radius: 4px;
  border-collapse: collapse;
  box-sizing: border-box;
  flex-grow: 1;
  > div {
    flex-grow: 1;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
`
const Target = styled.div``
const TitleContainer = styled.div`
  padding: 8px;
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  margin-bottom: 6px;
  user-select: none;
`
const Title = styled.h4`
margin 0;
`
const Explainer = styled.p`
  font-size: x-small;
  margin: 0;
  color: grey;
`
const TargetContainer = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  padding: 8px;
  background-color: ${(props) =>
    props.isDraggingOver ? 'rgba(74,20,140,0.1)' : 'white'};
`
const ElementContainer = styled.div`
  padding: 8.5px 14px;
  border: 1px solid lightgrey;
  margin-right: 4px;
  margin-top: 8px;
  border-radius: 4px;
  font-size: small;
  line-height: 16.6px;
  user-select: none;
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

const RowLabelTarget = ({ rowLabel, rowState }) => {
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

  const targetElements = rowLabel.map((el) => ({
    type: el.type,
    field: el.field ? targetFields.find((f) => f.id === el.field) : undefined,
    text: el.text,
    index: el.index,
  }))

  return (
    <Container>
      <Droppable droppableId="target">
        {(provided, snapshot) => (
          <Target ref={provided.innerRef} {...provided.droppableProps}>
            <TitleContainer>
              <Title>Datensatz-Beschriftung</Title>
              <Explainer>Ziehen Sie Felder hierhin.</Explainer>
              <Explainer>
                Ziehen Sie das entsprechende Werkzeug, um Zeichen zwischen
                Feldern zu platzieren.
              </Explainer>
            </TitleContainer>
            <TargetContainer isDraggingOver={snapshot.isDraggingOver}>
              {targetElements.map((el, index) => (
                <Draggable
                  key={el.field?.id ?? el.text ?? index}
                  draggableId={`${
                    el.field?.id ?? el.text ?? index
                  }draggableTarget`}
                  index={index}
                >
                  {(provided) => (
                    <div
                      key={el.field?.id ?? el.text ?? index}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                    >
                      {el.type === 'field' ? (
                        <ElementContainer>
                          {`${
                            el.field?.name ??
                            el.text ??
                            'neither fieldName nor text'
                          }`}
                        </ElementContainer>
                      ) : (
                        <BetweenCharacters
                          el={el}
                          rowState={rowState}
                          index={index}
                        />
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </TargetContainer>
          </Target>
        )}
      </Droppable>
    </Container>
  )
}

export default RowLabelTarget
