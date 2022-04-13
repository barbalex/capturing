import { Table, Field, Row } from '../dexieClient'
import labelFromLabeledTable from './labelFromLabeledTable'

type Objects = Table[] | Field[] | Row[]
type Props = {
  objects: Objects
  use_labels: boolean
}
// works for any table with label and name that is not projects itself
const sortByLabelName = ({ objects, use_labels }: Props): Objects =>
  objects.sort((a, b) => {
    const al = labelFromLabeledTable({ object: a, use_labels })
    const bl = labelFromLabeledTable({ object: b, use_labels })

    if (al < bl) return -1
    if (al === bl) return 0
    return 1
  })

export default sortByLabelName
