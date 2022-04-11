import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { FaPlus, FaLongArrowAltUp } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { Virtuoso } from 'react-virtuoso'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams, useNavigate } from 'react-router-dom'

import storeContext from '../../storeContext'
import Row from './Row'
import ErrorBoundary from '../shared/ErrorBoundary'
import constants from '../../utils/constants'
import { dexie } from '../../dexieClient'
import insertTable from '../../utils/insertTable'
import FilterNumbers from '../shared/FilterNumbers'

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
const FieldsContainer = styled.div`
  height: 100%;
`

const TablesComponent = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const store = useContext(storeContext)
  const { activeNodeArray, setActiveNodeArray, removeOpenNode, formHeight } =
    store

  const data = useLiveQuery(async () => {
    const [tables, project, filteredCount, totalCount] = await Promise.all([
      dexie.ttables.where({ deleted: 0 }).sortBy('name'), // TODO: if project.use_labels, use label
      dexie.projects.where({ id: projectId }).first(),
      dexie.ttables.where({ deleted: 0 }).count(), // TODO: pass in filter
      dexie.ttables.where({ deleted: 0 }).count(),
    ])

    return { tables, project, filteredCount, totalCount }
  })
  const tables = data?.tables
  const project = data?.project
  const filteredCount = data?.filteredCount
  const totalCount = data?.totalCount

  console.log('TablesComponent rendering', { tables, projectId, project })

  const add = useCallback(async () => {
    const newTableId = await insertTable({ project })
    navigate(newTableId)
  }, [navigate, project])

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
              <FaLongArrowAltUp />
            </IconButton>
            <IconButton
              aria-label="neue Tabelle"
              title="neue Tabelle"
              onClick={add}
              size="large"
              // TODO: get users role for this project
              disabled={!project}
            >
              <FaPlus />
            </IconButton>
            <FilterNumbers
              filteredCount={filteredCount}
              totalCount={totalCount}
            />
          </TitleSymbols>
        </TitleContainer>
        <FieldsContainer>
          <Virtuoso
            //initialTopMostItemIndex={initialTopMostIndex}
            height={formHeight}
            totalCount={tables?.length ?? 0}
            itemContent={(index) => (
              <Row key={index} row={(tables ?? [])[index]} />
            )}
          />
        </FieldsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(TablesComponent)
