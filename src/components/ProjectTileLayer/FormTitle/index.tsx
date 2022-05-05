import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

// import StoreContext from '../../../storeContext'
import FilterTitle from '../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../dexieClient'

const ProjectTileLayerFormTitleChooser = () => {
  const { projectId } = useParams()
  // const store = useContext(StoreContext)
  const showFilter = false // TODO:

  const data = useLiveQuery(async () => {
    const [filteredCount, totalCount] = await Promise.all([
      dexie.project_tile_layers
        .where({ deleted: 0, project_id: projectId })
        .count(), // TODO: pass in filter
      dexie.project_tile_layers
        .where({ deleted: 0, project_id: projectId })
        .count(),
    ])

    return { filteredCount, totalCount }
  })
  const filteredCount = data?.filteredCount
  const totalCount = data?.totalCount

  if (showFilter) {
    return (
      <FilterTitle
        title="Pixel/WMS-Karte"
        table="project_tile_layers"
        totalCount={totalCount}
        filteredCount={filteredCount}
      />
    )
  }

  return <FormTitle totalCount={totalCount} filteredCount={filteredCount} />
}

export default observer(ProjectTileLayerFormTitleChooser)
