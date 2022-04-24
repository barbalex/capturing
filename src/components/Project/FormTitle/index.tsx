import { observer } from 'mobx-react-lite'
import { useLiveQuery } from 'dexie-react-hooks'
import { Session } from '@supabase/supabase-js'
import { useParams } from 'react-router-dom'

// import StoreContext from '../../../storeContext'
import FilterTitle from '../../shared/FilterTitle'
import FormTitle from './FormTitle'
import { dexie } from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'

const ProjectFormTitleChooser = () => {
  const { projectId } = useParams()
  const session: Session = supabase.auth.session()
  // const store = useContext(StoreContext)
  const showFilter = false // TODO:

  const data = useLiveQuery(async () => {
    const [filteredCount, totalCount, projectUser] = await Promise.all([
      dexie.projects.where({ deleted: 0 }).count(), // TODO: pass in filter
      dexie.projects.where({ deleted: 0 }).count(),
      dexie.project_users.get({
        project_id: projectId,
        user_email: session?.user?.email,
      }),
    ])
    const userMayEdit: boolean = projectUser.role === 'project_manager'

    return { filteredCount, totalCount, userMayEdit }
  })
  const filteredCount = data?.filteredCount
  const totalCount = data?.totalCount
  const userMayEdit: boolean = data?.userMayEdit

  if (showFilter) {
    return (
      <FilterTitle
        title="Projekt"
        table="projects"
        totalCount={totalCount}
        filteredCount={filteredCount}
      />
    )
  }

  return <FormTitle totalCount={totalCount} filteredCount={filteredCount} />
}

export default observer(ProjectFormTitleChooser)
