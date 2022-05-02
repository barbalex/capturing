import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { FaPlus, FaArrowUp } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { Virtuoso } from 'react-virtuoso'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams, useNavigate, Link, resolvePath } from 'react-router-dom'

import storeContext from '../../storeContext'
import Row from './Row'
import ErrorBoundary from '../shared/ErrorBoundary'
import constants from '../../utils/constants'
import { dexie, ProjectTileLayer } from '../../dexieClient'
import insertProjectTileLayer from '../../utils/insertProjectTileLayer'
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

const ProjectTileLayersComponent = () => {
  const session = supabase.auth.session()
  const { projectId } = useParams()
  const navigate = useNavigate()

  const store = useContext(storeContext)
  const { activeNodeArray, removeNode, formHeight } = store

  const data = useLiveQuery(async () => {
    const [projectTileLayers, filteredCount, totalCount, projectUser] =
      await Promise.all([
        dexie.project_tile_layers
          .where({ deleted: 0, project_id: projectId })
          .sortBy('label'),
        dexie.project_tile_layers
          .where({ deleted: 0, project_id: projectId })
          .count(), // TODO: pass in filter
        dexie.project_tile_layers
          .where({ deleted: 0, project_id: projectId })
          .count(),
        dexie.project_users.get({
          project_id: projectId,
          user_email: session?.user?.email,
        }),
      ])

    return {
      projectTileLayers,
      filteredCount,
      totalCount,
      userMayEdit: [
        'account_manager',
        'project_manager',
        'project_editor',
      ].includes(projectUser?.role),
    }
  }, [projectId, session?.user?.email])
  const projectTileLayers: ProjectTileLayer[] = data?.projectTileLayers ?? []
  const filteredCount: integer = data?.filteredCount
  const totalCount: integer = data?.totalCount
  const userMayEdit: boolean = data?.userMayEdit

  const add = useCallback(async () => {
    const newId = await insertProjectTileLayer({ projectId })
    navigate(newId)
  }, [navigate, projectId])

  const onClickUp = useCallback(() => {
    removeNode(activeNodeArray)
  }, [activeNodeArray, removeNode])

  return (
    <ErrorBoundary>
      <Container showfilter={false}>
        <TitleContainer>
          <Title>Pixel-Karten</Title>
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
              aria-label="neue Pixel-Karte"
              title="neue Pixel-Karte"
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
          <Virtuoso
            height={formHeight}
            totalCount={projectTileLayers.length}
            itemContent={(index) => {
              const row = projectTileLayers[index]

              return <Row key={row.id} row={row} />
            }}
          />
        </RowsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(ProjectTileLayersComponent)
