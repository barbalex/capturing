import { useContext } from 'react'
import { observer } from 'mobx-react-lite'

import Node from '../Node'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'
import isNodeOpen from '../isNodeOpen'
import storeContext from '../../../storeContext'
import Folders from './Folders'

const EditingProject = ({ project }) => {
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
    childrenCount: 0,
  }
  const isOpen = isNodeOpen({ nodes, url })
  console.log('Editing, Project, isOpen', isOpen)

  return (
    <>
      <Node node={node} />
      {isOpen && <Folders project={project} />}
    </>
  )
}

export default observer(EditingProject)
