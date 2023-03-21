import { Table, Field, Row } from '../dexieClient'
import labelFromLabeledTable from './labelFromLabeledTable'

// https://www.typescriptlang.org/docs/handbook/2/conditional-types.html
type TableOrRowOrField<T extends Table | Row | Field> = T extends Table
  ? Table
  : T extends Row
  ? Row
  : Field
type Props = {
  objects: TableOrRowOrField[]
  useLabels: integer
}

// overloading the function
function sortByLabelName({
  objects,
  useLabels,
}: {
  objects: Table[]
  useLabels: integer
}): Table[]
function sortByLabelName({
  objects,
  useLabels,
}: {
  objects: Field[]
  useLabels: integer
}): Field[]
function sortByLabelName({
  objects,
  useLabels,
}: {
  objects: Row[]
  useLabels: integer
}): Row[]
// works for any table with label and name that is not projects itself
const sortByLabelName = ({ objects, useLabels }: Props) =>
  objects.sort((a, b) => {
    const al = labelFromLabeledTable({ object: a, useLabels })
    const bl = labelFromLabeledTable({ object: b, useLabels })

    if (al < bl) return -1
    if (al === bl) return 0
    return 1
  })

export default sortByLabelName
