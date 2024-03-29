import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import { FaPlus, FaArrowUp } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams, useNavigate, Link, resolvePath } from 'react-router-dom'

import storeContext from '../../storeContext'
import Row from './Row'
import ErrorBoundary from '../shared/ErrorBoundary'
import constants from '../../utils/constants'
import { dexie, Project, ProjectUser, Table } from '../../dexieClient'
import insertTable from '../../utils/insertTable'
import sortByLabelName from '../../utils/sortByLabelName'
import FilterNumbers from '../shared/FilterNumbers'
import { IStore } from '../../store'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
`
const TitleContainer = styled.div`
  background-color: rgba(74, 20, 140, 0.1);
  flex-shrink: 0;
  display: flex;
  @media print {
    display: none !important;
  }
  height: ${constants.titleRowHeight}px;
  justify-content: space-between;
  padding 0 10px;
  svg, a, div {
    color: rgba(0,0,0,0.8) !important;
  }
`
const Title = styled.div`
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
`
const TitleSymbols = styled.div`
  display: flex;
  margin-top: auto;
  margin-bottom: auto;
`
const RowsContainer = styled.div`
  height: 100%;
  overflow: auto;
`

const TablesComponent = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()

  // console.log('TablesComponent', { projectId, tableId, rowId })

  const store: IStore = useContext(storeContext)
  const { activeNodeArray, removeNode, editingProjects, session } = store
  const editing = editingProjects.get(projectId)?.editing ?? false

  const criteria = { deleted: 0, project_id: projectId }
  if (!editing) criteria.type = 'standard'

  const data = useLiveQuery(async () => {
    const [tables, filteredCount, totalCount, projectUser, project]: [
      Table[],
      number,
      number,
      ProjectUser,
      Project,
    ] = await Promise.all([
      dexie.ttables.where(criteria).toArray(),
      dexie.ttables.where(criteria).count(), // TODO: pass in filter
      dexie.ttables.where(criteria).count(),
      dexie.project_users.get({
        project_id: projectId,
        user_email: session?.user?.email,
      }),
      dexie.projects.get(projectId),
    ])

    return {
      tables: sortByLabelName({
        objects: tables,
        useLabels: project.use_labels,
      }),
      filteredCount,
      totalCount,
      useLabels: project.use_labels === 1,
      userMayEdit: [
        'account_manager',
        'project_manager',
        'project_editor',
      ].includes(projectUser?.role),
    }
  }, [projectId, session?.user?.email, criteria])

  const useLabels = data?.useLabels
  const tables = data?.tables ?? []
  const filteredCount = data?.filteredCount
  const totalCount = data?.totalCount
  const userMayEdit = data?.userMayEdit

  const add = useCallback(async () => {
    const newTableId = await insertTable({ projectId })
    navigate(newTableId)
  }, [navigate, projectId])

  const onClickUp = useCallback(() => {
    removeNode(activeNodeArray)
  }, [activeNodeArray, removeNode])

  return (
    <ErrorBoundary>
      <Container showfilter={false}>
        <TitleContainer>
          <Title>Tabellen</Title>
          <TitleSymbols>
            <IconButton
              title="Zum Projekt"
              component={Link}
              to={resolvePath(`..`, window.location.pathname)}
              onClick={onClickUp}
              size="large"
            >
              <FaArrowUp />
            </IconButton>
            <IconButton
              aria-label="neue Tabelle"
              title="neue Tabelle"
              onClick={add}
              size="large"
              disabled={!userMayEdit}
            >
              <FaPlus />
            </IconButton>
            <FilterNumbers
              filteredCount={filteredCount}
              totalCount={totalCount}
            />
          </TitleSymbols>
        </TitleContainer>
        <RowsContainer>
          {tables.map((row) => (
            <Row key={row.id} row={row} useLabels={useLabels} />
          ))}
        </RowsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(TablesComponent)
