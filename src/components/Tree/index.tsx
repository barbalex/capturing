import React, { useCallback, useEffect, useState, useContext } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { Tree } from 'react-arborist'
import styled from 'styled-components'
import AutoSizer from 'react-virtualized-auto-sizer'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'

import buildNodes from './nodes'
import Node from './Node'
import storeContext from '../../storeContext'
import openNodesFromActiveNodeArray from '../../utils/openNodesFromActiveNodeArray'

const Container = styled.div`
  width: 100%;
  height: 100%;
`

const TreeComponent = React.forwardRef((props, ref) => {
  const { projectId, tableId, rowId, fieldId } = useParams()
  const { pathname } = useLocation()

  const store = useContext(storeContext)
  const {
    editingProjects: editingProjectsRaw,
    activeNodeArray,
    openNodes,
    addOpenNode,
    setOpenNodes,
  } = store
  const editingProjects = getSnapshot(editingProjectsRaw)

  // on first render set openNodes
  // DO NOT add activeNodeArray to useEffet's dependency array or
  // it will not be possible to open multiple branches in tree
  // as openNodes is overwritten every time activeNodeArray changes
  useEffect(() => {
    setOpenNodes(openNodesFromActiveNodeArray(activeNodeArray))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [data, setData] = useState({
    id: 'root',
    children: [],
  })
  useEffect(() => {
    buildNodes({
      projectId,
      tableId,
      rowId,
      fieldId,
      editingProjects,
      pathname,
      activeNodeArray,
      openNodes,
      addOpenNode,
    }).then((dataBuilt) => setData(dataBuilt))
  }, [
    projectId,
    tableId,
    rowId,
    fieldId,
    editingProjects,
    pathname,
    activeNodeArray,
    openNodes,
    addOpenNode,
  ])

  console.log('Tree, openNodes:', getSnapshot(openNodes))

  const onToggle = useCallback((val) => {
    console.log('TreeComponent, this id was toggled:', val)
  }, [])

  return (
    <Container ref={ref}>
      {!!data && (
        <AutoSizer
          style={{
            height: '100%',
            width: '100%',
          }}
        >
          {({ height, width }) => (
            <Tree
              data={data}
              onToggle={onToggle}
              height={height}
              width={width}
              hideRoot
            >
              {Node}
            </Tree>
          )}
        </AutoSizer>
      )}
    </Container>
  )
})

export default observer(TreeComponent)
