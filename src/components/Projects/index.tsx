import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import { FaPlus } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'

import storeContext from '../../storeContext'
import Row from './Row'
import ErrorBoundary from '../shared/ErrorBoundary'
import constants from '../../utils/constants'
import { dexie } from '../../dexieClient'
import insertProject from '../../utils/insertProject'
import sortProjectsByLabelName from '../../utils/sortProjectsByLabelName'
import FilterNumbers from '../shared/FilterNumbers'
import { IStore } from '../../store'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
  svg,
  a,
  div {
    color: rgba(0, 0, 0, 0.7) !important;
  }
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
  overflow: auto;
`

const Projects = () => {
  const navigate = useNavigate()
  const store: IStore = useContext(storeContext)
  const { setProjectEditing } = store

  const data = useLiveQuery(async () => {
    const [projects, account, filteredCount, totalCount] = await Promise.all([
      dexie.projects.where({ deleted: 0 }).sortBy('', sortProjectsByLabelName),
      dexie.accounts.toCollection().first(),
      dexie.projects.where({ deleted: 0 }).count(), // TODO: pass in filter
      dexie.projects.where({ deleted: 0 }).count(),
    ])

    return {
      projects,
      account,
      filteredCount,
      totalCount,
    }
  })
  const projects = data?.projects ?? []
  const account = data?.account
  const filteredCount = data?.filteredCount
  const totalCount = data?.totalCount

  const add = useCallback(async () => {
    const newId = await insertProject({ account })
    navigate(newId)
    setProjectEditing({
      id: newId,
      editing: true,
    })
  }, [account, navigate, setProjectEditing])

  // console.log('ProjectsList rendering')

  return (
    <ErrorBoundary>
      <Container showfilter={false}>
        <TitleContainer>
          <Title>Projekte</Title>
          <TitleSymbols>
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
          {projects.map((row) => (
            <Row key={row?.id} row={row} />
          ))}
        </FieldsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(Projects)
