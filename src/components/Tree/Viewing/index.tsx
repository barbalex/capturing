import { useContext } from 'react'
import { observer } from 'mobx-react-lite'

import Node from '../Node'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'
import isNodeOpen from '../isNodeOpen'
import storeContext from '../../../storeContext'

// TODO: fetch childrenCount
const ViewingProject = ({ project }) => {
  const store = useContext(storeContext)
  const { nodes } = store

  const url = ['projects', project.id]
  const node = {
    id: project.id,
    label: labelFromLabeledTable({
      object: project,
      useLabels: project.use_labels,
    }),
    type: 'project',
    object: project,
    url,
    children: [],
    childrenCount: 0,
  }
  const isOpen = isNodeOpen({ nodes, url })

  return (
    <>
      <Node node={node} />
      {isOpen && <div>children</div>}
    </>
  )
}

export default observer(ViewingProject)
