import React, { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Tree } from 'react-arborist'
import styled from '@emotion/styled'
import AutoSizer from 'react-virtualized-auto-sizer'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'
import { useLiveQuery } from 'dexie-react-hooks'

import Node from './Node'
import storeContext from '../../storeContext'
import { dexie, Project } from '../../dexieClient'
import sortProjectsByLabelName from '../../utils/sortProjectsByLabelName'
import labelFromLabeledTable from '../../utils/labelFromLabeledTable'

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
      {projects.map((project) => {
        const editing = editingProjects[project.id]?.editing ?? false
        const node = {
          id: project.id,
          label: labelFromLabeledTable({
            object: project,
            useLabels: project.use_labels,
          }),
          type: 'project',
          object: project,
          activeNodeArray: ['projects', project.id],
          children: [],
          childrenCount: 0,
        }

        return <Node key={project.id} node={node} />
      })}
    </Container>
  )
})

export default observer(TreeComponent)
