import { getSnapshot } from 'mobx-state-tree'
import isEqual from 'lodash/isEqual'

const isNodeOpen = ({ nodes = [], url }) => {
  if (!url) return false

  console.log('isNodeOpen', { nodes: getSnapshot(nodes), url })

  return nodes.some((n) => isEqual(n, url))
}

export default isNodeOpen
