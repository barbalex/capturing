import { Table, Field, Row, Project } from '../dexieClient'

type Obj = Project | Table | Field | Row
interface Props {
  object: Obj
  useLabels: number
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
