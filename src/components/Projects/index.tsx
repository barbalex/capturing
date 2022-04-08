import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { FaPlus, FaLongArrowAltUp } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { Virtuoso } from 'react-virtuoso'
import { db as dexie, IProject } from '../../dexieClient'
import { useLiveQuery } from 'dexie-react-hooks'

import storeContext from '../../storeContext'
import Row from './Row'
import ErrorBoundary from '../shared/ErrorBoundary'
import constants from '../../utils/constants'

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

  const projects = useLiveQuery(
    async () =>
      await dexie.projects
        //.where({ deleted: false }) TODO: booleans are not indexable in IndexedDB > use 0/1
        //.equals('false')
        .orderBy('label')
        .toArray(),
  )
  console.log('Projects, projects:', projects)

  const add = useCallback(() => {
    console.log('TODO: insert project')
  }, [])

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
              <FaLongArrowAltUp />
            </IconButton>
            <IconButton
              aria-label="neues Projekt"
              title="neues Projekt"
              onClick={add}
              size="large"
            >
              <FaPlus />
            </IconButton>
          </TitleSymbols>
        </TitleContainer>
        <FieldsContainer>
          <Virtuoso
            //initialTopMostItemIndex={initialTopMostIndex}
            height={formHeight}
            totalCount={projects?.length ?? 0}
            itemContent={(index) => (
              <Row key={index} row={(projects ?? [])[index]} />
            )}
          />
        </FieldsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(Projects)
