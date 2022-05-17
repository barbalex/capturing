import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { FaPlus, FaArrowUp } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { Virtuoso } from 'react-virtuoso'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams, useNavigate, Link, resolvePath } from 'react-router-dom'
import { Session } from '@supabase/supabase-js'

import storeContext from '../../storeContext'
import Row from './Row'
import ErrorBoundary from '../shared/ErrorBoundary'
import constants from '../../utils/constants'
import { dexie, Project } from '../../dexieClient'
import insertField from '../../utils/insertField'
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

const FieldsComponent = () => {
  const session: Session = supabase.auth.session()
  const { projectId, tableId } = useParams()
  const navigate = useNavigate()
  const store = useContext(storeContext)
  const { activeNodeArray, removeNode, formHeight } = store

  // console.log('FieldsList rendering')

  const data = useLiveQuery(async () => {
    const [fields, filteredCount, totalCount, projectUser, project] =
      await Promise.all([
        dexie.fields.where({ deleted: 0, table_id: tableId }).sortBy('sort'),
        dexie.fields.where({ deleted: 0, table_id: tableId }).count(), // TODO: pass in filter
        dexie.fields.where({ deleted: 0, table_id: tableId }).count(),
        dexie.project_users.get({
          project_id: projectId,
          user_email: session?.user?.email,
        }),
        dexie.projects.get(projectId),
      ])

    return {
      fields,
      filteredCount,
      totalCount,
      userMayEdit: ['account_manager', 'project_manager'].includes(
        projectUser.role,
      ),
      project,
    }
  }, [tableId, projectId, session?.user?.email])

  const project: Project = data?.project
  const fields: Fields[] = data?.fields ?? []
  const filteredCount: integer = data?.filteredCount
  const totalCount: integer = data?.totalCount
  const userMayEdit: boolean = data?.userMayEdit

  const add = useCallback(async () => {
    const newId = await insertField({ tableId })
    navigate(newId)
  }, [navigate, tableId])

  const onClickUp = useCallback(() => {
    removeNode(activeNodeArray)
  }, [activeNodeArray, removeNode])

  return (
    <ErrorBoundary>
      <Container showfilter={false}>
        <TitleContainer>
          <Title>Felder</Title>
          <TitleSymbols>
            <IconButton
              title="Zur Tabelle"
              component={Link}
              to={resolvePath('..', window.location.pathname)}
              onClick={onClickUp}
              size="large"
            >
              <FaArrowUp />
            </IconButton>
            <IconButton
              aria-label="neues Feld"
              title="neues Feld"
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
            totalCount={fields.length}
            itemContent={(index) => {
              const row = fields[index]

              return <Row key={row.id} row={row} project={project} />
            }}
          />
        </RowsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(FieldsComponent)
