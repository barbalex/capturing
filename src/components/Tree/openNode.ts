import isNodeOpen from './isNodeOpen'

const openNode = async ({ node, nodes, store }) => {
  // make sure this node's url is not yet contained
  // otherwise same nodes will be added multiple times!
  if (isNodeOpen({ nodes, url: node.url })) return

  const newOpenNodes = [...nodes, node.url]

  store.setNodes(newOpenNodes)
}

export default openNode
