import isEqual from 'lodash/isEqual'

import { TreeNode } from './Viewing'

interface Props {
  node: TreeNode
  activeNodeArray: string[]
}

const isNodeInActiveNodePath = ({ node, activeNodeArray }: Props) => {
  if (!node) return false
  if (!node.url) return false
  if (!activeNodeArray) return false
  const activeNodeArrayPartWithEqualLength = activeNodeArray.slice(
    0,
    node.url.length,
  )
  return isEqual(activeNodeArrayPartWithEqualLength, node.url)
}

export default isNodeInActiveNodePath
