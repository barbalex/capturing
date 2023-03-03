import styled from '@emotion/styled'
import { useLiveQuery } from 'dexie-react-hooks'

import Node from './Node'
import { dexie, Project } from '../../dexieClient'
import sortProjectsByLabelName from '../../utils/sortProjectsByLabelName'
import labelFromLabeledTable from '../../utils/labelFromLabeledTable'
import IntoViewScroller from './IntoViewScroller'

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
`

const TreeComponent = () => {
  const projects: Project[] =
    useLiveQuery(
      async () =>
        await dexie.projects
          .where({ deleted: 0 })
          .sortBy('', sortProjectsByLabelName),
    ) ?? []

  // TODO: re-enable moving vectorLayers, tileLayers, fields
  // const onMove = useCallback(
  //   (idsMoved, folderDroppedIn, endIndex) => {
  //     onMoveFunction({ idsMoved, folderDroppedIn, endIndex, rebuildTree })
  //   },
  //   [rebuildTree],
  // )

  return (
    <Container>
      {projects.map((project) => {
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
      <IntoViewScroller />
    </Container>
  )
}

export default TreeComponent
