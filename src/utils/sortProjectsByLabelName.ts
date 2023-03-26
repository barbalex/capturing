import { Project } from '../dexieClient'
import labelFromLabeledTable from './labelFromLabeledTable'

const sortProjectsByLabelName = (p: Project[]) =>
  p.sort((a, b) => {
    const al = labelFromLabeledTable({ object: a, useLabels: a.use_labels })
    const bl = labelFromLabeledTable({ object: b, useLabels: b.use_labels })

    if (al < bl) return -1
    if (al === bl) return 0
    return 1
  })

export default sortProjectsByLabelName
