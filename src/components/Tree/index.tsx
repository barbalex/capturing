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

const Container = styled.div`
  width: 100%;
  height: 100%;
`

const TreeComponent = React.forwardRef((props, ref) => {
  const { projectId, tableId, rowId, fieldId } = useParams()
  const { pathname } = useLocation()

  const store = useContext(storeContext)
  const { editingProjects: editingProjectsRaw } = store
  const editingProjects = getSnapshot(editingProjectsRaw)

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
    }).then((dataBuilt) => setData(dataBuilt))
  }, [projectId, tableId, rowId, fieldId, editingProjects, pathname])

  console.log('Tree', { data, pathname })

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
