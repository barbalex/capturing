// TODO: add all project nodes
const nodesFromActiveNodeArray = (activeNodeArray) =>
  activeNodeArray.map((n, index) => activeNodeArray.slice(0, index + 1))

export default nodesFromActiveNodeArray
