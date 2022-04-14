import { useCallback } from 'react'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import styled from 'styled-components'

import { dexie, Field, Project } from '../../../../dexieClient'
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
}

const RowLabel = ({ project }: Props) => {
  const { tableId } = useParams()

  // TODO: on with https://egghead.io/lessons/react-persist-list-reordering-with-react-beautiful-dnd-using-the-ondragend-callback
  const onDragEnd = useCallback((result) => {
    // TODO:
  }, [])

  // const fields: Field[] = useLiveQuery(
  //   async () =>
  //     await dexie.fields.where({ table_id: tableId, deleted: 0 }).toArray(),
  //   [tableId],
  // )

  const targetFields: Field[] = []

  return (
    <Container>
      <DragDropContext onDragEnd={onDragEnd}>
        <Title>Datensatz-Beschriftung</Title>
        <Target>
          {targetFields.map((f) => (
            <div key={f.id}>
              {labelFromLabeledTable({
                object: f,
                useLabels: project?.use_labels,
              })}
            </div>
          ))}
        </Target>
        <FieldList project={project} />
      </DragDropContext>
    </Container>
  )
}

export default RowLabel
