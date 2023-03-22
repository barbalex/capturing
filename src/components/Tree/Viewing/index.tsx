import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'

import Node from '../Node'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'
import isNodeOpen from '../isNodeOpen'
import storeContext from '../../../storeContext'
import Tables from './Tables'
import {
  dexie,
  Project,
  Table,
  Field,
  VectorLayer,
  TileLayer,
  Row,
  ProjectUser,
} from '../../../dexieClient'
import { IStore } from '../../../store'

interface Props {
  project: Project
}

export interface TreeNode {
  id: string
  label: string
  type:
    | 'project'
    | 'table'
    | 'field'
    | 'vector_layer'
    | 'tile_layer'
    | 'row'
    | 'projectFolder'
    | 'tileLayerFolder'
    | 'vectorLayerFolder'
    | 'rowsFolder'
    | 'fieldsFolder'
  object: Project | Table | Row | Field | VectorLayer | TileLayer
  url: string[]
  children: TreeNode[]
  childrenCount: number
  projectId: string
}

const ViewingProject = ({ project }: Props) => {
  const store: IStore = useContext(storeContext)
  const { nodes, session } = store

  // query child tables
  // if none and user may not edit structure: do not render
  const data =
    useLiveQuery(async () => {
      const tablesCount: number = await dexie.ttables
        .where({
          deleted: 0,
          project_id: project.id,
        })
        .count()
      const projectUser: ProjectUser = await dexie.project_users.get({
        project_id: project.id,
        user_email: session?.user?.email,
      })

      const userMayEditStructure = [
        'account_manager',
        'project_manager',
      ].includes(projectUser?.role)
      return { tablesCount, userMayEditStructure }
    }, [project.id, session]) ?? []

  const tablesCount: number = data?.tablesCount ?? 0
  const userMayEditStructure: boolean = data?.userMayEditStructure ?? false

  if (tablesCount === 0 && !userMayEditStructure) return null

  const url = ['projects', project.id]
  const node: TreeNode = {
    id: project.id,
    label: labelFromLabeledTable({
      object: project,
      useLabels: project.use_labels,
    }),
    type: 'project',
    object: project,
    url,
    children: [],
    childrenCount: 1,
    projectId: project.id,
  }
  const isOpen = isNodeOpen({ nodes, url })

  return (
    <>
      <Node node={node} />
      {isOpen && <Tables project={project} />}
    </>
  )
}

export default observer(ViewingProject)
