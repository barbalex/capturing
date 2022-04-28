import React, {
  useContext,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { FaPlus, FaArrowUp } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { Virtuoso } from 'react-virtuoso'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams, useNavigate, Link, resolvePath } from 'react-router-dom'
import sortBy from 'lodash/sortBy'

import storeContext from '../../storeContext'
import RowComponent from './Row'
import ErrorBoundary from '../shared/ErrorBoundary'
import constants from '../../utils/constants'
import rowsWithLabelFromRows from '../../utils/rowsWithLabelFromRows'
import { dexie, Row, IProjectUser } from '../../dexieClient'
import insertRow from '../../utils/insertRow'
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

type RowsWithLabel = Row & { label: string }

const RowsComponent = () => {
  const session = supabase.auth.session()
  const { projectId, tableId } = useParams()
  const navigate = useNavigate()

  const store = useContext(storeContext)
  const { activeNodeArray, removeNode, formHeight } = store

  // console.log('RowsList rendering')

  const data = useLiveQuery(async () => {
    const [rows, filteredCount, totalCount, projectUser] = await Promise.all([
      dexie.rows.where({ deleted: 0, table_id: tableId }).toArray(),
      dexie.rows.where({ deleted: 0, table_id: tableId }).count(), // TODO: pass in filter
      dexie.rows.where({ deleted: 0, table_id: tableId }).count(),
      dexie.project_users.get({
        project_id: projectId,
        user_email: session?.user?.email,
      }),
    ])

    const rowsWithLabel = await rowsWithLabelFromRows(rows)

    return {
      rowsWithLabel,
      filteredCount,
      totalCount,
      userMayEdit: [
        'account_manager',
        'project_manager',
        'project_editor',
      ].includes(projectUser.role),
    }
  }, [tableId, projectId, session?.user?.email])

  const rowsWithLabel: RowsWithLabel[] = data?.rowsWithLabel ?? []
  const filteredCount: integer = data?.filteredCount
  const totalCount: integer = data?.totalCount
  const userMayEdit: boolean = data?.userMayEdit

  const add = useCallback(async () => {
    const newId = await insertRow({ tableId })
    navigate(newId)
  }, [navigate, tableId])

  const onClickUp = useCallback(() => {
    removeNode(activeNodeArray)
  }, [activeNodeArray, removeNode])

  return (
    <ErrorBoundary>
      <Container showfilter={false}>
        <TitleContainer>
          <Title>Datensätze</Title>
          <TitleSymbols>
            <IconButton
              title="Zur Tabelle"
              component={Link}
              to={resolvePath(`..`, window.location.pathname)}
              onClick={onClickUp}
              size="large"
            >
              <FaArrowUp />
            </IconButton>
            <IconButton
              aria-label="neuer Datensatz"
              title="neuer Datensatz"
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
            height={formHeight}
            totalCount={rowsWithLabel.length}
            itemContent={(index) => {
              const row = rowsWithLabel[index]

              return <RowComponent key={row.id} row={row} />
            }}
          />
        </RowsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(RowsComponent)
