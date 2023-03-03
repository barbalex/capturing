import React, { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Tree } from 'react-arborist'
import styled from '@emotion/styled'
import AutoSizer from 'react-virtualized-auto-sizer'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'
import { useLiveQuery } from 'dexie-react-hooks'

import buildNodes from './nodes'
import Node from './Node'
import storeContext from '../../storeContext'
import { dexie, Project } from '../../dexieClient'
import sortProjectsByLabelName from '../../utils/sortProjectsByLabelName'

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
  } = store
  const editingProjects = getSnapshot(editingProjectsRaw)

  const projects: Project[] =
    useLiveQuery(
      async () =>
        await dexie.projects
          .where({ deleted: 0 })
          .sortBy('', sortProjectsByLabelName),
    ) ?? []

  console.log('TreeComponent, projects:', projects)

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

  // TODO: re-enable moving vectorLayers, tileLayers, fields
  // const onMove = useCallback(
  //   (idsMoved, folderDroppedIn, endIndex) => {
  //     onMoveFunction({ idsMoved, folderDroppedIn, endIndex, rebuildTree })
  //   },
  //   [rebuildTree],
  // )

  // console.log('TreeComponent', { data, nodes: getSnapshot(nodes) })

  // Key on Tree needed
  // Without the key in Tree sometimes the tree is not rendered when data changes i.e. children are added
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
              key={JSON.stringify(data)}
              data={data}
              height={height}
              width={width}
            >
              {({ node, style, tree, dragHandle }) => (
                <Node
                  node={node}
                  style={style}
                  tree={tree}
                  dragHandle={dragHandle}
                  nodes={nodes}
                />
              )}
            </Tree>
          )}
        </AutoSizer>
      )}
    </Container>
  )
})

export default observer(TreeComponent)
