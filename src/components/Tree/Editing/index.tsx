import { useContext } from 'react'
import { observer } from 'mobx-react-lite'

import Node from '../Node'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'
import isNodeOpen from '../isNodeOpen'
import storeContext from '../../../storeContext'
import Folders from './Folders'
import { IStore } from '../../../store'

const EditingProject = ({ project }) => {
  const store: IStore = useContext(storeContext)
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
    childrenCount: 3,
    projectId: project.id,
  }
  const isOpen = isNodeOpen({ nodes, url })

  return (
    <>
      <Node node={node} />
      {isOpen && <Folders project={project} />}
    </>
  )
}

export default observer(EditingProject)
