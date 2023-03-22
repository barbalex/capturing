import { useContext } from 'react'
import styled from '@emotion/styled'
import { useLiveQuery } from 'dexie-react-hooks'
import { observer } from 'mobx-react-lite'

import { dexie, Project } from '../../dexieClient'
import sortProjectsByLabelName from '../../utils/sortProjectsByLabelName'
import IntoViewScroller from './IntoViewScroller'
import LastTouchedNodeSetter from './LastTouchedNodeSetter'
import storeContext from '../../storeContext'
import Editing from './Editing'
import Viewing from './Viewing'
import { IStore } from '../../store'

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
`

const TreeComponent = () => {
  const store: IStore = useContext(storeContext)
  const { editingProjects } = store

  const projects: Project[] | undefined = useLiveQuery(
    async () =>
      await dexie.projects
        .where({ deleted: 0 })
        .sortBy('', sortProjectsByLabelName),
  )

  // TODO: re-enable moving vectorLayers, tileLayers, fields
  // const onMove = useCallback(
  //   (idsMoved, folderDroppedIn, endIndex) => {
  //     onMoveFunction({ idsMoved, folderDroppedIn, endIndex, rebuildTree })
  //   },
  //   [rebuildTree],
  // )

  // console.log('TreeComponent, projects', projects)

  return (
    <Container>
      {(projects ?? []).map((project) => {
        const editing = editingProjects.get(project.id)?.editing ?? false

        return editing ? (
          <Editing key={project.id} project={project} />
        ) : (
          <Viewing key={project.id} project={project} />
        )
      })}
      <IntoViewScroller />
      <LastTouchedNodeSetter />
    </Container>
  )
}

export default observer(TreeComponent)
