import isEqual from 'lodash/isEqual'

interface Props {
  nodes: string[]
  url: string
}

const isNodeOpen = ({ nodes, url }: Props) => {
  if (!url) return false
  if (!nodes) return false

  return nodes.some((n) => isEqual(n, url))
}

export default isNodeOpen
