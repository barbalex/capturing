import { Table, Field, Row, Project } from '../dexieClient'

type Obj = Project | Table | Field | Row
type Props = {
  object: Obj
  useLabels: integer
}
// works for any table with label and name that is not projects itself
const labelFromLabeledTable = ({
  object,
  useLabels = 0,
  singular = false,
}: Props): string =>
  useLabels === 1
    ? singular
      ? object.singular_label ?? 'Datensatz' // only used for rows of tables
      : object.label ?? object.name ?? '(unbenannt)'
    : object.name ?? '(unbenannt)'

export default labelFromLabeledTable
