import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import { dexie, Table, IProjectUser } from '../../dexieClient'
import { useLiveQuery } from 'dexie-react-hooks'

import ErrorBoundary from '../shared/ErrorBoundary'
import Spinner from '../shared/Spinner'
import FormTitle from './FormTitle'
import Form from './Form'
import { supabase } from '../../supabaseClient'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
`

type DataProps = {
  row: Table
  projectUser: IProjectUser
}

const TableComponent = ({ filter: showFilter }) => {
  const session = supabase.auth.session()
  const { tableId, projectId } = useParams()
  const filter = 'TODO: was in store'

  const data: DataProps = useLiveQuery(async () => {
    const [row, projectUser] = await Promise.all(
      dexie.ttables.get(tableId),
      dexie.project_users
        .where({
          project_id: projectId,
          user_email: session?.user?.email,
        })
        .first(),
    )
    return { row, projectUser }
  }, [tableId])
  const row = data?.row
  const userRole = data?.projectUser?.role
  const userMayEdit = ['project_manager', 'project_editor'].includes(userRole)

  // console.log('Project rendering row:', { row, projectId })

  if (!row) return <Spinner />
  if (!showFilter && filter.show) return null

  return (
    <ErrorBoundary>
      <Container showfilter={showFilter}>
        <FormTitle
          row={row}
          showFilter={showFilter}
          userMayEdit={userMayEdit}
        />
        <Form showFilter={showFilter} id={tableId} row={row} />
      </Container>
    </ErrorBoundary>
  )
}

export default observer(TableComponent)