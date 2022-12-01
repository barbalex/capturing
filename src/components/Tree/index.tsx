import React, { useCallback, useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Tree } from 'react-arborist'
import styled from '@emotion/styled'
import AutoSizer from 'react-virtualized-auto-sizer'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'

import buildNodes from './nodes'
import Node from './Node'
import onMoveFunction from './onMove'
import storeContext from '../../storeContext'

const Container = styled.div`
  width: 100%;
  height: 100%;
`

const TreeComponent = React.forwardRef((props, ref) => {
  const { projectId, rowId, tableId, tableId2, rowId2 } = useParams()

  const store = useContext(storeContext)
  const {
    editingProjects: editingProjectsRaw,
    activeNodeArray,
    nodes,
    treeRebuildCount,
    rebuildTree,
  } = store
  const editingProjects = getSnapshot(editingProjectsRaw)

  const [data, setData] = useState([])
  useEffect(() => {
    buildNodes({
      rowId,
      tableId,
      tableId2,
      rowId2,
      editingProjects,
      nodes,
    }).then((dataBuilt) => setData(dataBuilt))
  }, [
    projectId,
    rowId,
    editingProjects,
    activeNodeArray,
    nodes.length,
    nodes,
    treeRebuildCount,
    tableId,
    tableId2,
    rowId2,
  ])

  // console.log('Tree, data:', data)

  const onToggle = useCallback(() => {
    // console.log('TreeComponent, this id was toggled:', val)
  }, [])
  const onMove = useCallback(
    (idsMoved, folderDroppedIn, endIndex) => {
      onMoveFunction({ idsMoved, folderDroppedIn, endIndex, rebuildTree })
    },
    [rebuildTree],
  )

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
              onMove={onMove}
              height={height}
              width={width}
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
