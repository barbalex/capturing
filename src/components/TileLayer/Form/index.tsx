import React, { useContext, useEffect, useCallback, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import isEqual from 'lodash/isEqual'
import { Session } from '@supabase/supabase-js'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'

import storeContext from '../../../storeContext'
import Checkbox2States from '../../shared/Checkbox2States'
import JesNo from '../../shared/JesNo'
import ErrorBoundary from '../../shared/ErrorBoundary'
import {
  dexie,
  TileLayerTypeEnum,
  ITileLayer,
  TileLayer,
} from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'
import TextField from '../../shared/TextField'
import Spinner from '../../shared/Spinner'
import ToggleButtonGroup from '../../shared/ToggleButtonGroup'
import MultiSelect from '../../shared/MultiSelect'
import Select from '../../shared/Select'
import Legends from './Legends'
import getCapabilitiesDataForTileLayer from './getCapabilitiesData'
import LocalData from './LocalData'

const FieldsContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`

// = '99999999-9999-9999-9999-999999999999'
const TileLayerForm = () => {
  const { projectId, tileLayerId } = useParams()

  const store = useContext(storeContext)
  const { errors, rebuildTree } = store

  const session: Session = supabase.auth.session()

  const unsetError = useCallback(
    () => () => {
      console.log('TODO: unsetError')
    },
    [],
  ) // TODO: add errors, unsetError in store
  useEffect(() => {
    unsetError('tile_layer')
  }, [tileLayerId, unsetError])

  const data = useLiveQuery(async () => {
    const [row, projectUser] = await Promise.all([
      dexie.tile_layers.get(tileLayerId),
      dexie.project_users.get({
        project_id: projectId,
        user_email: session?.user?.email,
      }),
    ])

    const userRole = projectUser?.role
    const userMayEdit = ['account_manager', 'project_manager'].includes(
      userRole,
    )

    return {
      row,
      userMayEdit,
    }
  }, [projectId, tileLayerId, session?.user?.email])

  const row: TileLayer = data?.row
  const userMayEdit: boolean = data?.userMayEdit

  const tileLayerTypeValues = Object.values(TileLayerTypeEnum).map((v) => ({
    value: v,
    label: v,
  }))

  // need original row to be able to roll back optimistic ui updates
  const originalRow = useRef<ITileLayer>()
  // need to update rowState on blur because of
  // when user directly closes app after last update in field
  // seems that waiting for dexie update goes too long
  const rowState = useRef<ITileLayer>()
  useEffect(() => {
    rowState.current = row
    // update originalRow only initially, once row has arrived
    if (!originalRow.current && row) {
      originalRow.current = row
    }
  }, [row])

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
    // TODO: if type changed
    // 1. remove all fields. But first ask user if is o.k.
    // 2. create new if value_list or id_value_list
  }, [row, session])

  useEffect(() => {
    window.onbeforeunload = () => {
      // save any data changed before closing tab or browser
      // only works if updateOnServer can run without waiting for an async process
      // https://stackoverflow.com/questions/36379155/wait-for-promises-in-onbeforeunload
      // which is why rowState.current is needed (instead of getting up to date row)
      updateOnServer()
      // do not return - otherwise user is dialogued, and that does not help the saving
    }
  }, [updateOnServer])

  const onBlur = useCallback(
    async (event) => {
      const { name: field, value, type, valueAsNumber } = event.target
      let newValue = type === 'number' ? valueAsNumber : value
      if ([undefined, '', NaN].includes(newValue)) newValue = null
      if (type === 'array' && field === 'wms_layers') {
        newValue = value.join(',')
      }
      // console.log('TileLayer Form onBlur', { newValue, type, field })

      // return if value has not changed
      const previousValue = rowState.current[field]
      if (newValue === previousValue) return

      // if (showFilter) {
      //   return filter.setValue({
      //     table: 'tile_layer',
      //     key: field,
      //     value: newValue,
      //   })
      // }

      // update rowState
      rowState.current = { ...row, ...{ [field]: newValue } }
      // update dexie
      dexie.tile_layers.update(row.id, { [field]: newValue })
      if (['label'].includes(field)) rebuildTree()
    },
    [rebuildTree, row],
  )

  useEffect(() => {
    if (!row?.wms_base_url) return
    if (row?._layerOptions?.length) return
    getCapabilitiesDataForTileLayer({ row, rebuildTree })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tileLayerId,
    row?.wms_base_url,
    row?._layerOptions?.length,
    row?.wms_layers,
  ])

  // const showDeleted = filter?.tile_layer?.deleted !== false || row?.deleted
  const showDeleted = false

  if (!row) return <Spinner />

  // console.log('TL Form rendering, localMaps:', localMaps)

  return (
    <ErrorBoundary>
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
          <>
            {showFilter ? (
              <JesNo
                key={`${row.id}deleted/jesno`}
                label="gelöscht"
                name="deleted"
                value={row.deleted}
                onBlur={onBlur}
                error={errors?.tile_layer?.deleted}
                disabled={!userMayEdit}
              />
            ) : (
              <Checkbox2States
                key={`${row.id}deleted/db`}
                label="gelöscht"
                name="deleted"
                value={row.deleted}
                onBlur={onBlur}
                error={errors?.tile_layer?.deleted}
                disabled={!userMayEdit}
              />
            )}
          </>
        )}
        <ToggleButtonGroup
          key={`${row.id}type`}
          value={row.type}
          name="type"
          dataSource={tileLayerTypeValues}
          onBlur={onBlur}
          label="Typ"
          error={errors?.tile_layer?.type}
        />
        {row?.type === 'wmts' && (
          <TextField
            key={`${row.id}wmts_url_template`}
            name="wmts_url_template"
            label="URL-Vorlage"
            value={row.wmts_url_template}
            onBlur={onBlur}
            error={errors?.tile_layer?.wmts_url_template}
            disabled={!userMayEdit}
            type="text"
            multiLine={true}
            helperText="ℹ Projektion muss 3857 oder 4326 sein. Beispiel (Server-abhängig): https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg"
          />
        )}
        {row?.type === 'wms' && (
          <>
            <TextField
              key={`${row.id}wms_base_url`}
              name="wms_base_url"
              label="Basis-URL"
              value={row.wms_base_url}
              onBlur={onBlur}
              error={errors?.tile_layer?.wms_base_url}
              disabled={!userMayEdit}
              type="text"
            />
            {!!row?.wms_base_url && (
              <>
                {row._layerOptions?.length > 0 && (
                  <MultiSelect
                    name="wms_layers"
                    value={row._layerOptions?.filter((o) =>
                      (row.wms_layers?.split?.(',') ?? []).includes(o.value),
                    )}
                    field="wms_layers"
                    label="Layer"
                    options={row._layerOptions}
                    onBlur={onBlur}
                    helperText={
                      row.wms_layers?.split?.(',')?.length > 1
                        ? 'Sie können mehrere wählen'
                        : ''
                    }
                  />
                )}
                {row._layerOptions?.length === 0 && (
                  <TextField
                    key={`${row.id}wms_layers/text`}
                    name="wms_layers"
                    label="Layer (wenn mehrere: mit Komma trennen. Beispiel: 'layer1,layer2')"
                    value={row.wms_layers}
                    onBlur={onBlur}
                    error={errors?.tile_layer?.wms_layers}
                    disabled={!userMayEdit}
                    multiLine
                  />
                )}
                {row._wmsFormatOptions?.length > 0 && (
                  <Select
                    key={`${row.id}wms_format/cb`}
                    name="wms_format"
                    value={row.wms_format}
                    field="wms_format"
                    label="(Bild-)Format"
                    options={row._wmsFormatOptions}
                    saveToDb={onBlur}
                    error={errors?.tile_layer?.wms_format}
                    disabled={!userMayEdit}
                    helperText={
                      row.wms_format === 'image/png'
                        ? ''
                        : `Empfehlung: 'image/png'. Ermöglicht transparenten Hintergrund`
                    }
                  />
                )}
                {row._wmsFormatOptions?.length === 0 && (
                  <TextField
                    key={`${row.id}wms_format/text`}
                    name="wms_format"
                    label="(Bild-)Format"
                    value={row.wms_format}
                    onBlur={onBlur}
                    error={errors?.tile_layer?.wms_format}
                    disabled={!userMayEdit}
                  />
                )}
                {row._infoFormatOptions?.length > 0 && (
                  <Select
                    key={`${row.id}wms_info_format/cb`}
                    name="wms_info_format"
                    value={row.wms_info_format}
                    field="wms_info_format"
                    label="Format der Informationen"
                    options={row._infoFormatOptions}
                    saveToDb={onBlur}
                    error={errors?.tile_layer?.wms_info_format}
                    disabled={!userMayEdit}
                    helperText={
                      row.wms_info_format === 'application/vnd.ogc.gml'
                        ? ''
                        : `Empfehlung: 'application/vnd.ogc.gml' oder ein anderes gml`
                    }
                  />
                )}
                {row._infoFormatOptions?.length === 0 && (
                  <TextField
                    key={`${row.id}wms_info_format/text`}
                    name="wms_info_format"
                    label="Format der Informationen"
                    value={row.wms_info_format}
                    onBlur={onBlur}
                    error={errors?.tile_layer?.wms_info_format}
                    disabled={!userMayEdit}
                  />
                )}
                <Checkbox2States
                  key={`${row.id}wms_transparent`}
                  label="Transparent (funktioniert nur bei geeigneten Bild-Formaten, v.a. png)"
                  name="wms_transparent"
                  value={row.wms_transparent}
                  onBlur={onBlur}
                  error={errors?.field?.wms_transparent}
                  disabled={!userMayEdit}
                />
                {!row.wms_version && (
                  <TextField
                    key={`${row.id}wms_version`}
                    name="wms_version"
                    label="WMS-Version (wird automatisch ausgelesen)"
                    value={row.wms_version}
                    onBlur={onBlur}
                    error={errors?.tile_layer?.wms_version}
                    disabled={true}
                  />
                )}
              </>
            )}
          </>
        )}
        <TextField
          key={`${row.id}label`}
          name="label"
          label="Beschriftung"
          value={row.label}
          onBlur={onBlur}
          error={errors?.tile_layer?.label}
          disabled={!userMayEdit}
        />
        <Checkbox2States
          key={`${row.id}active`}
          label="aktiv"
          name="active"
          value={row.active}
          onBlur={onBlur}
          error={errors?.field?.active}
          disabled={!userMayEdit}
        />
        <TextField
          key={`${row.id}sort`}
          name="sort"
          label="Sortierung"
          value={row.sort}
          onBlur={onBlur}
          error={errors?.tile_layer?.sort}
          disabled={!userMayEdit}
          type="number"
        />
        <TextField
          key={`${row.id}max_zoom`}
          name="max_zoom"
          label="Maximale Zoom-Stufe"
          value={row.max_zoom}
          onBlur={onBlur}
          error={errors?.tile_layer?.max_zoom}
          disabled={!userMayEdit}
          type="number"
        />
        <TextField
          key={`${row.id}min_zoom`}
          name="min_zoom"
          label="Minimale Zoom-Stufe"
          value={row.min_zoom}
          onBlur={onBlur}
          error={errors?.tile_layer?.min_zoom}
          disabled={!userMayEdit}
          type="number"
        />
        <TextField
          key={`${row.id}opacity`}
          name="opacity"
          label="Deckkraft / Opazität (0 - 1)"
          value={row.opacity}
          onBlur={onBlur}
          error={errors?.tile_layer?.opacity}
          disabled={!userMayEdit}
          type="number"
        />
        <Checkbox2States
          key={`${row.id}greyscale`}
          label="Grautöne statt Farben"
          name="greyscale"
          value={row.greyscale}
          onBlur={onBlur}
          error={errors?.field?.greyscale}
          disabled={!userMayEdit}
        />
        {row?.type === 'wmts' && (
          <LocalData row={row} userMayEdit={userMayEdit} />
        )}
        <Legends row={row} />
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(TileLayerForm)
