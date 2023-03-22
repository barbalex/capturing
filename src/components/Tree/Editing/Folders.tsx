import { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { observer } from 'mobx-react-lite'

import { dexie, Project } from '../../../dexieClient'
import Node from '../Node'
import isNodeOpen from '../isNodeOpen'
import storeContext from '../../../storeContext'
import VectorLayers from './VectorLayers'
import TileLayers from './TileLayers'
import Tables from './Tables'
import { IStore } from '../../../store'
import { TreeNode } from '../Viewing'

const ProjectFolders = ({ project }: { project: Project }) => {
  const store: IStore = useContext(storeContext)
  const { nodes } = store

  const data = useLiveQuery(async () => {
    const [tablesCount, tileLayersCount, vectorLayersCount]: [
      number,
      number,
      number,
    ] = await Promise.all([
      dexie.ttables
        .where({
          deleted: 0,
          project_id: project.id,
        })
        .count(),
      dexie.tile_layers
        .where({
          deleted: 0,
          project_id: project.id,
        })
        .count(),
      dexie.vector_layers
        .where({
          deleted: 0,
          project_id: project.id,
        })
        .count(),
    ])

    return { tablesCount, tileLayersCount, vectorLayersCount }
  })

  if (!data) return null

  const tablesNode: TreeNode = {
    id: `${project.id}/tablesFolder`,
    label: `Tabellen (${data.tablesCount})`,
    type: 'projectFolder',
    object: project,
    url: ['projects', project.id, 'tables'],
    childrenCount: data.tablesCount,
    projectId: project.id,
  }
  const tablesOpen = isNodeOpen({
    nodes,
    url: ['projects', project.id, 'tables'],
  })
  const tileLayersNode: TreeNode = {
    id: `${project.id}/tileLayersFolder`,
    label: `Bild-Karten (${data.tileLayersCount})`,
    type: 'tileLayerFolder',
    object: project,
    url: ['projects', project.id, 'tile-layers'],
    childrenCount: data.tileLayersCount,
    projectId: project.id,
  }
  const tileLayersOpen = isNodeOpen({
    nodes,
    url: ['projects', project.id, 'tile-layers'],
  })
  const vectorLayersNode: TreeNode = {
    id: `${project.id}/vectorLayersFolder`,
    label: `Vektor-Karten (${data.vectorLayersCount})`,
    type: 'vectorLayerFolder',
    object: project,
    url: ['projects', project.id, 'vector-layers'],
    childrenCount: data.vectorLayersCount,
    projectId: project.id,
  }
  const vectorLayersOpen = isNodeOpen({
    nodes,
    url: ['projects', project.id, 'vector-layers'],
  })

  return (
    <>
      <Node node={tablesNode} />
      {tablesOpen && <Tables project={project} />}
      <Node node={tileLayersNode} />
      {tileLayersOpen && <TileLayers project={project} />}
      <Node node={vectorLayersNode} />
      {vectorLayersOpen && <VectorLayers project={project} />}
    </>
  )
}

export default observer(ProjectFolders)
