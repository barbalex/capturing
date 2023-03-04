import { useContext } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { observer } from 'mobx-react-lite'

import { dexie } from '../../../dexieClient'
import Node from '../Node'
import isNodeOpen from '../isNodeOpen'
import storeContext from '../../../storeContext'

const ProjectFolders = ({ project }) => {
  const store = useContext(storeContext)
  const { nodes } = store

  console.log('Editing, ProjectFolders', { project, nodes })

  const data = useLiveQuery(async () => {
    const [tablesCount, tileLayersCount, vectorLayersCount] = await Promise.all(
      [
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
      ],
    )

    return { tablesCount, tileLayersCount, vectorLayersCount }
  })

  console.log('Editing, ProjectFolders, data', data)

  const tablesNode = {
    id: `${project.id}/tablesFolder`,
    label: 'Tabellen',
    type: 'projectFolder',
    object: project,
    url: ['projects', project.id, 'tables'],
    isOpen: isNodeOpen({ nodes, url: ['projects', project.id, 'tables'] }),
    childrenCount: data?.tablesCount,
  }
  const tileLayersNode = {
    id: `${project.id}/tileLayersFolder`,
    label: 'Bild-Karten',
    type: 'tileLayerFolder',
    object: project,
    url: ['projects', project.id, 'tile-layers'],
    isOpen: isNodeOpen({
      nodes,
      url: ['projects', project.id, 'tile-layers'],
    }),
    childrenCount: data?.tileLayersCount,
  }
  const vectorLayersNode = {
    id: `${project.id}/vectorLayersFolder`,
    label: 'Vektor-Karten',
    type: 'vectorLayerFolder',
    object: project,
    url: ['projects', project.id, 'vector-layers'],
    isOpen: isNodeOpen({
      nodes,
      url: ['projects', project.id, 'vector-layers'],
    }),
    childrenCount: data?.vectorLayersCount,
  }

  // TODO: show loading indicator
  if (!data) return null

  return (
    <>
      <Node node={tablesNode} />
      <Node node={tileLayersNode} />
      <Node node={vectorLayersNode} />
    </>
  )
}

export default observer(ProjectFolders)
