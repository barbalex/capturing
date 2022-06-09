import styled from 'styled-components'
import { withResizeDetector } from 'react-resize-detector'
import { useLiveQuery } from 'dexie-react-hooks'
import { Session } from '@supabase/supabase-js'
import { useParams } from 'react-router-dom'

import DeleteButton from './DeleteButton'
import AddButton from './AddButton'
import NavButtons from './NavButtons'
import FilterNumbers from '../../shared/FilterNumbers'
import Menu from '../../shared/Menu'
import EditButton from './EditButton'
import { supabase } from '../../../supabaseClient'
import { dexie } from '../../../dexieClient'

const TitleContainer = styled.div` 
  background-color: rgba(74, 20, 140, 0.1);
  display: flex;
  flex-shrink: 0;
  flex-grow: 0;
  flex-wrap: wrap;
  justify-content: space-between;
  padding 0 10px;
  svg, a, div {
    color: rgba(0,0,0,0.7) !important;
  }
  @media print {
    display: none !important;
  }
`
const Title = styled.div`
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
  padding-right: 40px;
  user-select: none;
  height: 52px;
  line-height: 52px;
  text-align: center;
`
const TitleSymbols = styled.div`
  display: flex;
  margin-top: auto;
  margin-bottom: auto;
  justify-content: flex-end;
  flex-grow: 1;
  flex-wrap: wrap;
`

const ProjectFormTitle = ({ totalCount, filteredCount, width }) => {
  const { projectId } = useParams()
  const session: Session = supabase.auth.session()

  const userMayEdit: boolean = useLiveQuery(async () => {
    const projectUser = await dexie.project_users.get({
      project_id: projectId,
      user_email: session?.user?.email,
    })

    return ['account_manager', 'project_manager'].includes(projectUser?.role)
  })

  if (width < 760) {
    return (
      <TitleContainer>
        <Title>Projekt</Title>
        <TitleSymbols>
          <NavButtons />
          <Menu white={false}>
            {userMayEdit && [
              <EditButton key="EditButton" />,
              <AddButton key="AddButton" />,
              <DeleteButton key="DeleteButton" />,
            ]}
            <FilterNumbers
              filteredCount={filteredCount}
              totalCount={totalCount}
              asMenu
            />
          </Menu>
        </TitleSymbols>
      </TitleContainer>
    )
  }

  if (width < 775) {
    return (
      <TitleContainer>
        <Title>Projekt</Title>
        <TitleSymbols>
          <NavButtons />
          {userMayEdit && [
            <EditButton key="EditButton" />,
            <AddButton key="AddButton" />,
            <DeleteButton key="DeleteButton" />,
          ]}
          <Menu white={false}>
            <FilterNumbers
              filteredCount={filteredCount}
              totalCount={totalCount}
              asMenu
            />
          </Menu>
        </TitleSymbols>
      </TitleContainer>
    )
  }

  return (
    <TitleContainer>
      <Title>Projekt</Title>
      <TitleSymbols>
        <NavButtons />
        {userMayEdit && (
          <>
            <EditButton />
            <AddButton />
            <DeleteButton />
          </>
        )}
        <FilterNumbers filteredCount={filteredCount} totalCount={totalCount} />
      </TitleSymbols>
    </TitleContainer>
  )
}

export default withResizeDetector(ProjectFormTitle)
