import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Tree } from 'react-arborist'
import styled from 'styled-components'

import buildTree from './build'

function Node({ innerRef, data, styles, handlers, state, tree }) {
  return (
    <div ref={innerRef} style={styles.row}>
      <div style={styles.indent}>{data.name}</div>
    </div>
  )
}

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
    buildTree({ projectId, tableId, rowId, fieldId }).then((dataBuilt) => {
      console.log('TreeComponent effect, got data:', dataBuilt)
      setData(dataBuilt)
    })
  }, [projectId, tableId, rowId, fieldId])

  console.log('Tree, data:', data)

  const onToggle = useCallback((val) => {
    console.log('TreeComponent, onToggle, val:', val)
  }, [])

  return (
    <Container ref={ref}>{!!data && <Tree data={data}>{Node}</Tree>}</Container>
  )
})

export default TreeComponent
