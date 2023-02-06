import { useContext } from 'react'
import styled from '@emotion/styled'
import { withResizeDetector } from 'react-resize-detector'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

import DeleteButton from './DeleteButton'
import AddButton from './AddButton'
import NavButtons from './NavButtons'
import FilterNumbers from '../../shared/FilterNumbers'
import Menu from '../../shared/Menu'
import EditButton from './EditButton'
import { dexie } from '../../../dexieClient'
import storeContext from '../../../storeContext'

const TitleContainer = styled.div` 
  background-color: rgba(74, 20, 140, 0.1);
  display: flex;
  flex-shrink: 0;
  flex-grow: 0;
  flex-wrap: wrap;
  justify-content: space-between;
  padding 0 10px;
  svg, a, div {
    color: rgba(0,0,0,0.8) !important;
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
  padding-left: 10px;
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
  const { session } = useContext(storeContext)
  const { projectId } = useParams()

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

export default withResizeDetector(observer(ProjectFormTitle))
