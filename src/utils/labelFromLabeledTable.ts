import { Table, Field, Row, Project } from '../dexieClient'

type Obj = Project | Table | Field | Row
type Props = {
  object: Obj
  use_labels: boolean
}
// works for any table with label and name that is not projects itself
const labelFromLabeledTable = ({ object, use_labels: useLabels }: Props): Obj =>
  useLabels
    ? object.label ?? object.name ?? '(unbenannt)'
    : object.name ?? '(unbenannt)'

export default labelFromLabeledTable
