import isNodeOpen from './isNodeOpen'
import { IStoreSnapshotOut } from '../../store'
import { TreeNode } from './Viewing'

interface Props {
  node: TreeNode
  nodes: string[]
  store: IStoreSnapshotOut
}

const openNode = async ({ node, nodes, store }: Props) => {
  // make sure this node's url is not yet contained
  // otherwise same nodes will be added multiple times!
  if (isNodeOpen({ nodes, url: node.url })) return

  const newOpenNodes = [...nodes, node.url]

  store.setNodes(newOpenNodes)
}

export default openNode
