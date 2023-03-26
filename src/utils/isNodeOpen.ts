// import { getSnapshot } from 'mobx-state-tree'
import isEqual from 'lodash/isEqual'

interface Props {
  nodes: string[][]
  url: string[]
}

const isNodeOpen = ({ nodes = [], url }: Props) =>
  nodes.some((n) => isEqual(n, url))

export default isNodeOpen
