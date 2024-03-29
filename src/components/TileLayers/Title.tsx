import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import { FaPlus, FaArrowUp } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams, useNavigate, Link, resolvePath } from 'react-router-dom'

import storeContext from '../../storeContext'
import ErrorBoundary from '../shared/ErrorBoundary'
import constants from '../../utils/constants'
import { dexie, ProjectUser } from '../../dexieClient'
import insertTileLayer from '../../utils/insertTileLayer'
import FilterNumbers from '../shared/FilterNumbers'
import { IStore } from '../../store'

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

const TileLayersTitle = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const store: IStore = useContext(storeContext)
  const { activeNodeArray, removeNode, session } = store

  const data = useLiveQuery(async () => {
    const [filteredCount, totalCount, projectUser]: [
      number,
      number,
      ProjectUser,
    ] = await Promise.all([
      dexie.tile_layers.where({ deleted: 0, project_id: projectId }).count(), // TODO: pass in filter
      dexie.tile_layers.where({ deleted: 0, project_id: projectId }).count(),
      dexie.project_users.get({
        project_id: projectId,
        user_email: session?.user?.email,
      }),
    ])

    return {
      filteredCount,
      totalCount,
      userMayEdit: [
        'account_manager',
        'project_manager',
        'project_editor',
      ].includes(projectUser?.role),
    }
  }, [projectId, session?.user?.email])
  const filteredCount = data?.filteredCount
  const totalCount = data?.totalCount
  const userMayEdit = data?.userMayEdit

  const add = useCallback(async () => {
    const newId = await insertTileLayer({ projectId })
    navigate(newId)
  }, [navigate, projectId])

  const onClickUp = useCallback(() => {
    removeNode(activeNodeArray)
  }, [activeNodeArray, removeNode])

  return (
    <ErrorBoundary>
      <TitleContainer>
        <Title>Bild-Karten</Title>
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
            aria-label="neue Bild-Karte"
            title="neue Bild-Karte"
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
    </ErrorBoundary>
  )
}

export default observer(TileLayersTitle)
