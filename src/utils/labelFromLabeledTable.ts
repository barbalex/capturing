import { Table, Field, Row, Project } from '../dexieClient'

type Obj = Project | Table | Field | Row
type Props = {
  object: Obj
  useLabels: integer
}
// works for any table with label and name that is not projects itself
const labelFromLabeledTable = ({ object, useLabels }: Props): Obj =>
  useLabels === 1
    ? object.label ?? object.name ?? '(unbenannt)'
    : object.name ?? '(unbenannt)'

export default labelFromLabeledTable
