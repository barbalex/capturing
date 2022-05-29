import React, { useContext, useEffect, useCallback, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import isEqual from 'lodash/isEqual'
import { Session } from '@supabase/supabase-js'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../storeContext'
import Checkbox2States from './shared/Checkbox2States'
import ErrorBoundary from './shared/ErrorBoundary'
import ColorPicker from './shared/ColorPicker'
import {
  dexie,
  LayerStyle,
  LineCapEnum,
  LineJoinEnum,
  FillRuleEnum,
} from '../dexieClient'
import { supabase } from '../supabaseClient'
import TextField from './shared/TextField'
import Spinner from './shared/Spinner'
import RadioButtonGroup from './shared/RadioButtonGroup'

import constants from '../utils/constants'

const Container = styled.div`
  margin: 25px -10px 0 -10px;
`
const TitleRow = styled.div`
  background-color: rgba(248, 243, 254, 1);
  flex-shrink: 0;
  display: flex;
  height: ${constants.titleRowHeight}px;
  justify-content: space-between;
  padding: 0 10px;
  cursor: pointer;
  user-select: none;
  position: sticky;
  top: -10px;
  z-index: 4;
  &:first-of-type {
    margin-top: -10px;
  }
`
const Title = styled.div`
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
`
const FieldsContainer = styled.div`
  padding: 15px 10px 10px 10px;
`

const LayerStyleForm = ({ userMayEdit }) => {
  const session: Session = supabase.auth.session()
  const { projectTileLayerId, projectVectorLayerId, tableId } = useParams()
  const store = useContext(StoreContext)
  const { errors } = store

  const unsetError = useCallback(
    () => () => {
      console.log('TODO: unsetError')
    },
    [],
  ) // TODO: add errors, unsetError in store
  useEffect(() => {
    unsetError('project')
  }, [projectTileLayerId, projectVectorLayerId, tableId, unsetError])

  const criteria = tableId
    ? { table_id: tableId }
    : projectTileLayerId
    ? { project_tile_layer_id: projectTileLayerId }
    : projectVectorLayerId
    ? { project_vector_layer_id: projectVectorLayerId }
    : 'none'
  const row: Row = useLiveQuery(async () => {
    const _row: Row = await dexie.layer_styles.get(criteria)
    // TODO: create layer_style for this table / project_tile_layer / project_vector_layer
    // IF it does not yet exist

    return _row
  }, [projectTileLayerId, projectVectorLayerId, tableId])

  const originalRow = useRef<LayerStyle>()
  const rowState = useRef<LayerStyle>()
  useEffect(() => {
    rowState.current = row
    if (!originalRow.current && row) {
      originalRow.current = row
    }
  }, [row])

  console.log('LayerStyleForm rendering', {
    row,
    projectVectorLayerId,
    criteria,
  })

  const updateOnServer = useCallback(async () => {
    // only update if is changed
    if (isEqual(originalRow.current, rowState.current)) return

    row.updateOnServer({
      was: originalRow.current,
      is: rowState.current,
      session,
    })
    // ensure originalRow is reset too
    originalRow.current = rowState.current
  }, [row, session])

  useEffect(() => {
    window.onbeforeunload = async () => {
      // save any data changed before closing tab or browser
      updateOnServer()
    }
  }, [updateOnServer])

  const onBlur = useCallback(
    async (event) => {
      const { name: field, value, type, valueAsNumber } = event.target
      let newValue = type === 'number' ? valueAsNumber : value
      if ([undefined, '', NaN].includes(newValue)) newValue = null

      // only update if value has changed
      const previousValue = rowState.current[field]
      if (newValue === previousValue) return

      // update rowState
      rowState.current = { ...row, ...{ [field]: newValue } }
      // update dexie
      dexie.layer_styles.update(row.id, { [field]: newValue })
    },
    [row],
  )

  const showDeleted = false

  const lineCapValues = Object.values(LineCapEnum).map((v) => ({
    value: v,
    label: v,
  }))
  const lineJoinValues = Object.values(LineJoinEnum).map((v) => ({
    value: v,
    label: v,
  }))
  const fillRuleValues = Object.values(FillRuleEnum).map((v) => ({
    value: v,
    label: v,
  }))

  if (!row) return null // no spinner as is null until enough data input

  return (
    <ErrorBoundary>
      <Container>
        <TitleRow>
          <Title>Geometrien stylen</Title>
        </TitleRow>
        {!!row && (
          <FieldsContainer
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                // focus left the container
                // https://github.com/facebook/react/issues/6410#issuecomment-671915381
                updateOnServer()
              }
            }}
          >
            {showDeleted && (
              <Checkbox2States
                label="gelöscht"
                name="deleted"
                value={row.deleted}
                onBlur={onBlur}
                error={errors?.project?.deleted}
                disabled={!userMayEdit}
              />
            )}
            <TextField
              name="icon_url"
              label="URL für Punkt-Icon"
              value={row.icon_url}
              onBlur={onBlur}
              error={errors?.project?.icon_url}
              disabled={!userMayEdit}
            />
            <TextField
              name="icon_retina_url"
              label="URL für Punkt-Icon, hochauflösend"
              value={row.icon_retina_url}
              onBlur={onBlur}
              error={errors?.project?.icon_retina_url}
            />
            <TextField
              name="icon_size"
              label="Icon Grösse (in Bild-Punkten)"
              value={row.icon_size}
              onBlur={onBlur}
              error={errors?.project?.icon_size}
              type="number"
              disabled={!userMayEdit}
            />
            <Checkbox2States
              label="(Umriss-)Linien zeichnen (Polygone und Kreise)"
              name="stroke"
              value={row.stroke}
              onBlur={onBlur}
              error={errors?.project?.stroke}
            />
            <ColorPicker
              id={`${row.id}/color`}
              label="Linien: Farbe"
              onBlur={onBlur}
              color={row.color}
              name="color"
              disabled={!userMayEdit}
            />
            <TextField
              name="weight"
              label="Linien: Breite (in Bild-Punkten)"
              value={row.weight}
              onBlur={onBlur}
              error={errors?.project?.weight}
              type="number"
              disabled={!userMayEdit}
            />
            <TextField
              name="opacity"
              label="Linien: Deckkraft / Opazität"
              value={row.opacity}
              onBlur={onBlur}
              error={errors?.project?.opacity}
              type="number"
              disabled={!userMayEdit}
            />
            <div>
              <RadioButtonGroup
                name="line_cap"
                value={row.line_cap}
                field="line_cap"
                label="Linien: Abschluss"
                dataSource={lineCapValues}
                onBlur={onBlur}
                error={errors?.field?.line_cap}
                disabled={!userMayEdit}
              />
            </div>
            <div>
              <RadioButtonGroup
                name="line_join"
                value={row.line_join}
                field="line_join"
                label="Linien: Ecken"
                dataSource={lineJoinValues}
                onBlur={onBlur}
                error={errors?.field?.line_join}
                disabled={!userMayEdit}
              />
            </div>
            <TextField
              name="dash_array"
              label="Linien: Dash-Array"
              value={row.dash_array}
              onBlur={onBlur}
              error={errors?.project?.dash_array}
              disabled={!userMayEdit}
            />
            <TextField
              name="dash_offset"
              label="Linien: Dash-Offset"
              value={row.dash_offset}
              onBlur={onBlur}
              error={errors?.project?.dash_offset}
              disabled={!userMayEdit}
            />
            <Checkbox2States
              label="Flächen füllen"
              name="fill"
              value={row.fill}
              onBlur={onBlur}
              error={errors?.project?.fill}
              disabled={!userMayEdit}
            />
            <ColorPicker
              id={`${row.id}/fill_color`}
              label="Füllung: Farbe"
              name="fill_color"
              onBlur={onBlur}
              color={row.fill_color}
              disabled={!userMayEdit}
            />
            <TextField
              name="fill_opacity"
              label="Füllung: Deckkraft / Opazität"
              value={row.fill_opacity}
              onBlur={onBlur}
              error={errors?.project?.fill_opacity}
              type="number"
              disabled={!userMayEdit}
            />
            <div>
              <RadioButtonGroup
                name="fill_rule"
                value={row.fill_rule}
                field="fill_rule"
                label="Füllung: Regel, um den Inhalt von Flächen zu bestimmen"
                dataSource={fillRuleValues}
                onBlur={onBlur}
                error={errors?.field?.fill_rule}
                disabled={!userMayEdit}
              />
            </div>
          </FieldsContainer>
        )}
      </Container>
    </ErrorBoundary>
  )
}

export default observer(LayerStyleForm)
