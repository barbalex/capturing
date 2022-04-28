import React, { useCallback, useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Tree } from 'react-arborist'
import styled from 'styled-components'
import AutoSizer from 'react-virtualized-auto-sizer'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'

import buildNodes from './nodes'
import Node from './Node'
import storeContext from '../../storeContext'

const Container = styled.div`
  width: 100%;
  height: 100%;
`

const TreeComponent = React.forwardRef((props, ref) => {
  const { projectId, tableId, rowId, fieldId } = useParams()

  const store = useContext(storeContext)
  const { editingProjects: editingProjectsRaw, activeNodeArray, nodes } = store
  const editingProjects = getSnapshot(editingProjectsRaw)

  const [data, setData] = useState({
    id: 'root',
    children: [],
  })
  useEffect(() => {
    buildNodes({
      tableId,
      rowId,
      fieldId,
      editingProjects,
      activeNodeArray,
      nodes,
    }).then((dataBuilt) => setData(dataBuilt))
  }, [
    projectId,
    tableId,
    rowId,
    fieldId,
    editingProjects,
    activeNodeArray,
    nodes.length, // need length because array of array os not observed
    nodes,
  ])

  // console.log('Tree, nodes:', getSnapshot(nodes))

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
