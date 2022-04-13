import { DragDropContext } from 'react-beautiful-dnd'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import styled from 'styled-components'

import { dexie, Field, Table, Project } from '../../../dexieClient'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'

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
const FieldList = styled.div``
const FieldContainer = styled.div`
  padding: 8px;
  border: 1px solid lightgrey;
  margin-bottom: 8px;
  border-radius: 2px;
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
}

const RowLabel = ({ project }: Props) => {
  const { tableId } = useParams()

  const fields: Field[] = useLiveQuery(
    async () =>
      await dexie.fields.where({ table_id: tableId, deleted: 0 }).toArray(),
    [tableId],
  )

  const fieldsMap = new Map(
    fields.map((f) => [
      f.id,
      labelFromLabeledTable({ object: f, useLabels: project.use_labels }),
    ]),
  )
  const targetFields: Field[] = []

  console.log('RowLabel, fields:', fields)

  const initialData = {
    fields: new Map(
      fields.map((f) => [
        f.id,
        labelFromLabeledTable({ object: f, useLabels: project.use_labels }),
      ]),
    ),
    columns: {
      target: { id: 'target', title: 'Datensatz-Beschriftung', fieldIds: [] },
    },
  }
  console.log('RowLabel, initialData:', initialData)

  return (
    <Container>
      <Title>Datensatz-Beschriftung</Title>
      <Target>
        {targetFields.map((f) => (
          <div key={f.id}>
            {labelFromLabeledTable({
              object: f,
              useLabels: project.use_labels,
            })}
          </div>
        ))}
      </Target>
      <FieldList>
        {fields.map((f) => (
          <FieldContainer key={f.id}>
            {labelFromLabeledTable({
              object: f,
              useLabels: project.use_labels,
            })}
          </FieldContainer>
        ))}
      </FieldList>
    </Container>
  )
}

export default RowLabel
