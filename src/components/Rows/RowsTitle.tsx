import React, { useContext, useCallback, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
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
import { dexie } from '../../dexieClient'
import insertRow from '../../utils/insertRow'
import FilterNumbers from '../shared/FilterNumbers'
import { supabase } from '../../supabaseClient'

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

type RowsWithLabel = Row & { label: string }
type Props = {
  rowsWithLabel: RowsWithLabel
}

const RowsTitle = ({ rowsWithLabel }: Props) => {
  const session = supabase.auth.session()
  const { projectId, tableId } = useParams()
  const navigate = useNavigate()

  const store = useContext(storeContext)
  const { activeNodeArray, removeNode } = store

  const [bbox, bboxIsInfinite] = useMemo(() => {
    const fc = {
      type: 'FeatureCollection',
      features: rowsWithLabel.map((e) => ({
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
    const [filteredCount, totalCount, projectUser] = await Promise.all([
      dexie.rows.where({ deleted: 0, table_id: tableId }).count(), // TODO: pass in filter
      dexie.rows.where({ deleted: 0, table_id: tableId }).count(),
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
      ].includes(projectUser.role),
    }
  }, [tableId, projectId, session?.user?.email])

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
