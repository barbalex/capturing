import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { FaPlus, FaArrowUp } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { Virtuoso } from 'react-virtuoso'
import { useLiveQuery } from 'dexie-react-hooks'

import storeContext from '../../storeContext'
import Row from './Row'
import ErrorBoundary from '../shared/ErrorBoundary'
import constants from '../../utils/constants'
import { dexie } from '../../dexieClient'
import insertProject from '../../utils/insertProject'
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

const Projects = () => {
  const store = useContext(storeContext)
  const { activeNodeArray, setActiveNodeArray, removeOpenNode, formHeight } =
    store

  const data = useLiveQuery(async () => {
    const [projects, account, filteredCount, totalCount] = await Promise.all([
      dexie.projects.where({ deleted: 0 }).sortBy('name'), // TODO: if project.use_labels, use label
      dexie.accounts.orderBy('id').limit(1).first(),
      dexie.projects.where({ deleted: 0 }).count(), // TODO: pass in filter
      dexie.projects.where({ deleted: 0 }).count(),
    ])

    return { projects, account, filteredCount, totalCount }
  })
  const projects = data?.projects ?? []
  const account = data?.account
  const filteredCount = data?.filteredCount
  const totalCount = data?.totalCount

  const add = useCallback(async () => {
    const newProjectId = await insertProject({ account })
    setActiveNodeArray([...activeNodeArray, newProjectId])
  }, [account, activeNodeArray, setActiveNodeArray])

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
    setActiveNodeArray(activeNodeArray.slice(0, -1))
  }, [activeNodeArray, removeOpenNode, setActiveNodeArray])
  let upTitle = 'Eine Ebene höher'
  if (activeNodeArray[0] === 'projects') {
    upTitle = 'Zu allen Listen'
  }

  return (
    <ErrorBoundary>
      <Container showfilter={false}>
        <TitleContainer>
          <Title>Projekte</Title>
          <TitleSymbols>
            <IconButton title={upTitle} onClick={onClickUp} size="large">
              <FaArrowUp />
            </IconButton>
            <IconButton
              aria-label="neues Projekt"
              title="neues Projekt"
              onClick={add}
              size="large"
              disabled={!account}
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
            totalCount={projects.length}
            itemContent={(index) => {
              const row = projects[index]

              return <Row key={row?.id} row={row} />
            }}
          />
        </FieldsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(Projects)
