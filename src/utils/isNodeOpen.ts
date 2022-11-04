import isEqual from 'lodash/isEqual'

const isNodeOpen = ({ nodes = [], url }) => {
  if (!url) return false

  return nodes.some((n) => isEqual(n, url))
}

export default isNodeOpen
