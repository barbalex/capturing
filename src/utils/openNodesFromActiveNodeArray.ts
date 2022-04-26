// TODO: add all project nodes
const openNodesFromActiveNodeArray = (activeNodeArray) =>
  activeNodeArray.map((n, index) => activeNodeArray.slice(0, index + 1))

export default openNodesFromActiveNodeArray
