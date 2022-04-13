import { DragDropContext } from 'react-beautiful-dnd'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'

import { dexie, Field, Table, Project } from '../../../dexieClient'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'

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

  console.log('RowLabel, fields:', fields)

  const initialData = {
    fields: new Map(
      fields.map((f) => [
        f.id,
        labelFromLabeledTable({ object: f, useLabels: project.use_labels }),
      ]),
    ),
    columns: { target: { id: 'target', fieldIds: [] } },
  }
  console.log('RowLabel, initialData:', initialData)

  return <div>row label tool</div>
}

export default RowLabel
