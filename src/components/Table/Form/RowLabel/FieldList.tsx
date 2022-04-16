import { Draggable, Droppable } from 'react-beautiful-dnd'
import styled from 'styled-components'

import { Field, Project } from '../../../../dexieClient'
import labelFromLabeledTable from '../../../../utils/labelFromLabeledTable'

const Container = styled.div`
  margin: 0;
  border: 1px solid lightgrey;
  border-radius: 2px;
`
const Title = styled.h4`
  margin 0;
  padding: 8px;
`
const FieldList = styled.div`
  padding: 4px;
  min-width: 240px;
`
const FieldContainer = styled.div`
  padding: 4px;
  border: 1px solid lightgrey;
  margin-bottom: 4px;
  border-radius: 2px;
  font-size: small;
`

/**
 * Have two versions:
 * 1. editing
 *    - (horizontal?) list of draggable fields
 *    - text field element to drag between field elements and input some text
 *    - drop area, horizontally sortable
 *      edit creates array of: {field: id, type: 'field'},{text, type: 'text'}
 * 2. presentation: only the drop area
 * 3. remind user to first define the fields
 */
type Props = {
  project: Project
  fields: Field[]
}

const RowLabel = ({ project, fields }: Props) => {
  // const fieldsMap = new Map(
  //   fields.map((f) => [
  //     f.id,
  //     labelFromLabeledTable({ object: f, useLabels: project.use_labels }),
  //   ]),
  // )

  console.log('RowLabel, fields:', fields)

  return (
    <Container>
      <Title>Felder</Title>
      <Droppable droppableId="fieldList">
        {(provided) => (
          <FieldList ref={provided.innerRef} {...provided.droppableProps}>
            {(fields ?? []).map((f, index) => (
              <Draggable
                key={f.id}
                draggableId={`${f.id}draggableField`}
                index={index}
              >
                {(provided) => (
                  <FieldContainer
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                  >
                    {labelFromLabeledTable({
                      object: f,
                      useLabels: project?.use_labels,
                    })}
                  </FieldContainer>
                )}
              </Draggable>
            ))}
            <Draggable
              key="textfield"
              draggableId="textfield"
              index={fields.length}
            >
              {(provided) => (
                <FieldContainer
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  ref={provided.innerRef}
                >
                  {'Zeichen vor/nach/zwischen Feldern'}
                </FieldContainer>
              )}
            </Draggable>
            {provided.placeholder}
          </FieldList>
        )}
      </Droppable>
    </Container>
  )
}

export default RowLabel
