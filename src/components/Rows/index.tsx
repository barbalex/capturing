import React, { useContext, useCallback, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { FaPlus, FaArrowUp } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { Virtuoso } from 'react-virtuoso'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams, useNavigate, Link } from 'react-router-dom'
import sortBy from 'lodash/sortBy'

import storeContext from '../../storeContext'
import RowComponent from './Row'
import ErrorBoundary from '../shared/ErrorBoundary'
import constants from '../../utils/constants'
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

type DataProps = {
  rows: Row[]
  filteredCount: integer
  totalCount: integer
  projectUser: IProjectUser
}

const RowsComponent = () => {
  const session = supabase.auth.session()
  const { projectId, tableId } = useParams()
  const navigate = useNavigate()
  const store = useContext(storeContext)
  const { activeNodeArray, removeOpenNode, formHeight } = store

  const data: DataProps = useLiveQuery(async () => {
    const [rows, filteredCount, totalCount, projectUser] = await Promise.all([
      dexie.rows.where({ deleted: 0, table_id: tableId }).toArray(),
      dexie.rows.where({ deleted: 0, table_id: tableId }).count(), // TODO: pass in filter
      dexie.rows.where({ deleted: 0, table_id: tableId }).count(),
      dexie.project_users.get({
        project_id: projectId,
        user_email: session?.user?.email,
      }),
    ])

    return { rows, filteredCount, totalCount, projectUser }
  }, [tableId, projectId, session?.user?.email])

  const rows: Rows[] = data?.rows ?? []
  const [rowsWithLabel, setRowsWithLabel] = useState([])
  useEffect(() => {
    if (!data?.rows?.length) return
    const promises = data.rows.map((r) =>
      r.label.then((label) => ({ ...r, label })),
    )
    Promise.all(promises).then((rowsWithLabel) =>
      setRowsWithLabel(sortBy(rowsWithLabel, (r) => r.label)),
    )
  }, [data?.rows])

  const filteredCount = data?.filteredCount
  const totalCount = data?.totalCount
  const userRole = data?.projectUser?.role
  const userMayEdit = ['project_manager', 'project_editor'].includes(userRole)
  console.log('Rows', {
    rows,
    rowsWithLabel,
  })

  const add = useCallback(async () => {
    const newId = await insertRow({ tableId })
    navigate(newId)
  }, [navigate, tableId])

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
  }, [activeNodeArray, removeOpenNode])

  return (
    <ErrorBoundary>
      <Container showfilter={false}>
        <TitleContainer>
          <Title>Datensätze</Title>
          <TitleSymbols>
            <IconButton
              title="Zur Tabelle"
              component={Link}
              to={`/${activeNodeArray.slice(0, -1).join('/')}`}
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
            //initialTopMostItemIndex={initialTopMostIndex}
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
