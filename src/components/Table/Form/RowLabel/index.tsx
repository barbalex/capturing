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
 *      edit creates array of: {field: id, type: 'field'},{text, type: 'text'}
 * 2. presentation: only the drop area
 * 3. remind user to first define the fields
 */
type Props = {
  project: Project
}

const RowLabel = ({ project }: Props) => {
  const { tableId } = useParams()

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
