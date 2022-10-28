import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { withResizeDetector } from 'react-resize-detector'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import DeleteButton from './DeleteButton'
import AddButton from './AddButton'
import NavButtons from './NavButtons'
import ZoomToButton from './ZoomToButton'
import FilterNumbers from '../../shared/FilterNumbers'
import Menu from '../../shared/Menu'
import { dexie, IProjectUser } from '../../../dexieClient'
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

const TableFormTitle = ({ totalCount, filteredCount, width }) => {
  const { projectId } = useParams()
  const { session } = useContext(storeContext)

  const userMayEdit: boolean = useLiveQuery(async () => {
    const projectUser: IProjectUser = await dexie.project_users.get({
      project_id: projectId,
      user_email: session?.user?.email,
    })
    const userRole = projectUser.role
    const userMayEdit = [
      'account_manager',
      'project_manager',
      'project_editor',
    ].includes(userRole)

    return userMayEdit
  }, [projectId, session?.user?.email])

  if (width < 600) {
    return (
      <TitleContainer>
        <Title>Tabelle</Title>
        <TitleSymbols>
          <NavButtons />
          <Menu white={false}>
            <AddButton userMayEdit={userMayEdit} />
            <DeleteButton userMayEdit={userMayEdit} />
            <ZoomToButton />
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

  if (width < 650) {
    return (
      <TitleContainer>
        <Title>Tabelle</Title>
        <TitleSymbols>
          <NavButtons />
          <AddButton userMayEdit={userMayEdit} />
          <DeleteButton userMayEdit={userMayEdit} />
          <Menu white={false}>
            <ZoomToButton />
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
      <Title>Tabelle</Title>
      <TitleSymbols>
        <NavButtons />
        <AddButton userMayEdit={userMayEdit} />
        <DeleteButton userMayEdit={userMayEdit} />
        <ZoomToButton />
        <FilterNumbers filteredCount={filteredCount} totalCount={totalCount} />
      </TitleSymbols>
    </TitleContainer>
  )
}

export default withResizeDetector(observer(TableFormTitle))
