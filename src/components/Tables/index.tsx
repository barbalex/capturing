import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { FaPlus, FaArrowUp } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { Virtuoso } from 'react-virtuoso'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams, useNavigate } from 'react-router-dom'

import storeContext from '../../storeContext'
import Row from './Row'
import ErrorBoundary from '../shared/ErrorBoundary'
import constants from '../../utils/constants'
import { dexie, Table } from '../../dexieClient'
import insertTable from '../../utils/insertTable'
import FilterNumbers from '../shared/FilterNumbers'
import { supabase } from '../../supabaseClient'

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
`

const TablesComponent = () => {
  const session = supabase.auth.session()
  const { projectId } = useParams()
  const navigate = useNavigate()
  const store = useContext(storeContext)
  const { activeNodeArray, setActiveNodeArray, removeOpenNode, formHeight } =
    store

  const data = useLiveQuery(async () => {
    const [tables, filteredCount, totalCount, projectUser] = await Promise.all([
      dexie.ttables.where({ deleted: 0 }).sortBy('name'), // TODO: if project.use_labels, use label
      dexie.ttables.where({ deleted: 0 }).count(), // TODO: pass in filter
      dexie.ttables.where({ deleted: 0 }).count(),
      dexie.project_users
        .where({
          project_id: projectId,
          user_email: session?.user?.email,
        })
        .first(),
    ])

    return { tables, filteredCount, totalCount, projectUser }
  })
  const tables: Table = data?.tables ?? []
  const filteredCount = data?.filteredCount
  const totalCount = data?.totalCount
  const userRole = data?.projectUser?.role
  const userMayEdit = ['project_manager', 'project_editor'].includes(userRole)

  console.log('TablesComponent', {
    projectUser: data?.projectUser,
    userRole,
    userMayEdit,
  })

  const add = useCallback(async () => {
    const newTableId = await insertTable({ projectId })
    navigate(newTableId)
  }, [navigate, projectId])

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
    setActiveNodeArray(activeNodeArray.slice(0, -1))
  }, [activeNodeArray, removeOpenNode, setActiveNodeArray])

  return (
    <ErrorBoundary>
      <Container showfilter={false}>
        <TitleContainer>
          <Title>Tabellen</Title>
          <TitleSymbols>
            <IconButton title="Zum Projekt" onClick={onClickUp} size="large">
              <FaArrowUp />
            </IconButton>
            <IconButton
              aria-label="neue Tabelle"
              title="neue Tabelle"
              onClick={add}
              size="large"
              // TODO: get users role for this project
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
          <Virtuoso
            //initialTopMostItemIndex={initialTopMostIndex}
            height={formHeight}
            totalCount={tables.length}
            itemContent={(index) => {
              const row = tables[index]

              return <Row key={row.id} row={row} />
            }}
          />
        </RowsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(TablesComponent)
