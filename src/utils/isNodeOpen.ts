// import { getSnapshot } from 'mobx-state-tree'
import isEqual from 'lodash/isEqual'

const isNodeOpen = ({ nodes = [], url }) => {
  if (!url) return false

  const isOpen = nodes.some((n) => isEqual(n, url))
  // console.log('isNodeOpen', { nodes: getSnapshot(nodes), url, isOpen })

  return isOpen
}

export default isNodeOpen
