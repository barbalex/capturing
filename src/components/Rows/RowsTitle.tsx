import React, { useContext, useCallback, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import { FaPlus, FaArrowUp } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams, useNavigate, Link, resolvePath } from 'react-router-dom'
import getBbox from '@turf/bbox'
import isEqual from 'lodash/isEqual'

import storeContext from '../../storeContext'
import ErrorBoundary from '../shared/ErrorBoundary'
import ZoomToButton from '../shared/ZoomToButton'
import constants from '../../utils/constants'
import { dexie, Table, Project, ProjectUser } from '../../dexieClient'
import insertRow from '../../utils/insertRow'
import FilterNumbers from '../shared/FilterNumbers'
import labelFromLabeledTable from '../../utils/labelFromLabeledTable'
import { IStore } from '../../store'
import { RowWithLabel } from '../../utils/rowsWithLabelFromRows'

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

type Props = {
  rowsWithLabel: RowWithLabel[]
  level: number
}

const RowsTitle = ({ rowsWithLabel, level }: Props) => {
  const params = useParams()
  const projectId = params.projectId
  const tableId = params[`tableId${level}`]
  const navigate = useNavigate()

  const store: IStore = useContext(storeContext)
  const { activeNodeArray, removeNode, editingProjects, session } = store
  const editing = editingProjects.get(projectId)?.editing ?? false

  const [bbox, bboxIsInfinite] = useMemo(() => {
    const fc = {
      type: 'FeatureCollection',
      features: rowsWithLabel
        .filter((r) => !!r.geometry)
        .map((e) => ({
          geometry: e.geometry,
          type: 'Feature',
        })),
    }
    const bbox = getBbox(fc)
    const bboxIsInfinite = isEqual(bbox, [
      Infinity,
      Infinity,
      -Infinity,
      -Infinity,
    ])
    return [bbox, bboxIsInfinite]
  }, [rowsWithLabel])

  // console.log('RowsTitle', { bbox, bboxIsInfinity: bboxIsInfinite })

  const data = useLiveQuery(async () => {
    const [
      filteredCount,
      totalCount,
      projectUser,
      tablesOfProject,
      table,
      project,
    ]: [number, number, ProjectUser, Table[], Table, Project] =
      await Promise.all([
        dexie.rows.where({ deleted: 0, table_id: tableId }).count(), // TODO: pass in filter
        dexie.rows.where({ deleted: 0, table_id: tableId }).count(),
        dexie.project_users.get({
          project_id: projectId,
          user_email: session?.user?.email,
        }),
        dexie.ttables
          .where({
            deleted: 0,
            project_id: projectId,
            type: 'standard',
          })
          .toArray(),
        dexie.ttables.get(tableId),
        dexie.projects.get(projectId),
      ])

    const tableLabel = labelFromLabeledTable({
      object: table,
      useLabels: project.use_labels,
      singular: false,
    })

    return {
      filteredCount,
      totalCount,
      userMayEdit: [
        'account_manager',
        'project_manager',
        'project_editor',
      ].includes(projectUser.role),
      tablesOfProject,
      tableLabel,
    }
  }, [tableId, projectId, session?.user?.email])

  const filteredCount = data?.filteredCount
  const totalCount = data?.totalCount
  const userMayEdit = data?.userMayEdit
  const tablesOfProject = data?.tablesOfProject ?? []
  const tableLabel = data?.tableLabel ?? 'Datensätze'
  const tableLabelToUse = tableLabel
  // console.log('RowsTitle', { tableLabel })

  const add = useCallback(async () => {
    const newId = await insertRow({ tableId })
    navigate(newId)
  }, [navigate, tableId])

  const onClickUp = useCallback(() => {
    removeNode(activeNodeArray)
  }, [activeNodeArray, removeNode])

  const up = editing
    ? resolvePath(`..`, window.location.pathname)
    : tablesOfProject.length === 1
    ? resolvePath(`projects/${projectId}`)
    : resolvePath(`../..`, window.location.pathname)
  const upTitle = editing
    ? 'Zur Tabelle'
    : tablesOfProject.length === 1
    ? 'Zum Projekt'
    : 'Zu den Tabellen'

  return (
    <ErrorBoundary>
      <TitleContainer>
        <Title>{tableLabelToUse}</Title>
        <TitleSymbols>
          <IconButton
            title={upTitle}
            component={Link}
            to={up}
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
            disabled={!userMayEdit}
          >
            <FaPlus />
          </IconButton>
          <ZoomToButton bbox={bbox} geometryExists={!bboxIsInfinite} />
          <FilterNumbers
            filteredCount={filteredCount}
            totalCount={totalCount}
          />
        </TitleSymbols>
      </TitleContainer>
    </ErrorBoundary>
  )
}

export default observer(RowsTitle)
