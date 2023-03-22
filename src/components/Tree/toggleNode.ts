import isNodeOpen from './isNodeOpen'
import openNode from '../openNode'
import { TreeNode } from './Viewing'
import { IStoreSnapshotOut } from '../../store'

interface Props {
  node: TreeNode
  store: IStoreSnapshotOut
  navigate: (url: string) => void
  search: string
}

const toggleNode = ({ node, store, navigate, search }: Props) => {
  if (!node.url) throw new Error('passed node has no url')
  const { nodes, activeNodeArray, setLastTouchedNode, setOpenNodes } = store

  let newActiveNodeArray = []
  let newNodes = [...nodes]
  if (!isNodeOpen({ nodes, url: node.url })) {
    // node is closed
    // open it and make it the active node
    openNode({ node, nodes, store })
    newActiveNodeArray = [...node.url]
    // some elements are numbers but they are contained in url as text
    // eslint-disable-next-line eqeqeq
  } else if (node.urlLabel == activeNodeArray.slice(-1)[0]) {
    // the node is open
    // AND it is the active node
    // make it's parent the new active node
    newActiveNodeArray = [...node.url]
    newActiveNodeArray.pop()
    // remove all children of this url
    newNodes = newNodes.filter(
      (n) => !isEqual(n.slice(0, node.url.length), node.url),
    )
    setOpenNodes(newNodes)
  } else {
    // the node is open
    // but not the active node
    // make it the new active node
    newActiveNodeArray = [...node.url]
    // remove all children of this url
    newNodes = newNodes.filter(
      (n) => !isEqual(n.slice(0, node.url.length), node.url),
    )
    setOpenNodes(newNodes)
  }
  navigate(`/${newActiveNodeArray.join('/')}${search}`)
  setLastTouchedNode(node.url)
}

export default toggleNode
