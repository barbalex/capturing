import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Tree } from 'react-arborist'
import styled from 'styled-components'
import AutoSizer from 'react-virtualized-auto-sizer'

import buildNodes from './nodes'
import Node from './Node'

const Container = styled.div`
  width: 100%;
  height: 100%;
`

const TreeComponent = React.forwardRef((props, ref) => {
  const { projectId, tableId, rowId, fieldId } = useParams()

  const [data, setData] = useState({
    id: 'root',
    children: [],
  })
  useEffect(() => {
    console.log('TreeComponent effect, running')
    buildNodes({ projectId, tableId, rowId, fieldId }).then((dataBuilt) => {
      console.log('TreeComponent effect, got data:', dataBuilt)
      setData(dataBuilt)
    })
  }, [projectId, tableId, rowId, fieldId])

  console.log('Tree, data:', data)

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

export default TreeComponent
