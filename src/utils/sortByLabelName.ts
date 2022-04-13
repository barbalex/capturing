import { Table, Field, Row } from '../dexieClient'
import labelFromLabeledTable from './labelFromLabeledTable'

type Objects = Table[] | Field[] | Row[]
type Props = {
  objects: Objects
  useLabels: boolean
}
// works for any table with label and name that is not projects itself
const sortByLabelName = ({ objects, useLabels }: Props): Objects =>
  objects.sort((a, b) => {
    const al = labelFromLabeledTable({ object: a, useLabels })
    const bl = labelFromLabeledTable({ object: b, useLabels })

    if (al < bl) return -1
    if (al === bl) return 0
    return 1
  })

export default sortByLabelName
