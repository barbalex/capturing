import React, {
  useContext,
  useEffect,
  useCallback,
  useRef,
  useState,
  useMemo,
} from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import isEqual from 'lodash/isEqual'
import { Session } from '@supabase/supabase-js'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../../storeContext'
import Checkbox2States from '../../shared/Checkbox2States'
import CheckboxGroup from '../../shared/CheckboxGroup'
import JesNo from '../../shared/JesNo'
import ErrorBoundary from '../../shared/ErrorBoundary'
import {
  dexie,
  TileLayerTypeEnum,
  IProjectTileLayer,
  ProjectTileLayer,
} from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'
import TextField from '../../shared/TextField'
import Spinner from '../../shared/Spinner'
import RadioButtonGroup from '../../shared/RadioButtonGroup'
import Legends from './Legends'
import getCapabilitiesData from './getCapabilitiesData'
import setValuesFromCapabilities from './setValuesFromCapabilities'

const FieldsContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`

// = '99999999-9999-9999-9999-999999999999'
const ProjectTileLayerForm = () => {
  const { projectId, projectTileLayerId } = useParams()

  const store = useContext(StoreContext)
  const { errors } = store

  const session: Session = supabase.auth.session()

  const unsetError = useCallback(
    () => () => {
      console.log('TODO: unsetError')
    },
    [],
  ) // TODO: add errors, unsetError in store
  useEffect(() => {
    unsetError('project_tile_layer')
  }, [projectTileLayerId, unsetError])

  const data = useLiveQuery(async () => {
    const [row, projectUser] = await Promise.all([
      dexie.project_tile_layers.get(projectTileLayerId),
      dexie.project_users.get({
        project_id: projectId,
        user_email: session?.user?.email,
      }),
    ])

    const userRole = projectUser?.role
    const userMayEdit = ['account_manager', 'project_manager'].includes(
      userRole,
    )

    // const { wmsFormatValues, layerOptions, legendUrls, infoFormatValues } =
    //   await getCapabilities({ onBlur, row })

    return {
      row,
      userMayEdit,
      // wmsFormatValues,
      // layerOptions,
      // legendUrls,
      // infoFormatValues,
    }
  }, [projectId, projectTileLayerId, session?.user?.email])

  const row: ProjectTileLayer = data?.row
  const userMayEdit: boolean = data?.userMayEdit
  // const wmsFormatValues = data?.wmsFormatValues
  // const layerOptions = data?.layerOptions
  // const legendUrls = data?.legendUrls
  // const infoFormatValues = data?.infoFormatValues

  const tileLayerTypeValues = Object.values(TileLayerTypeEnum).map((v) => ({
    value: v,
    label: v,
  }))

  // need original row to be able to roll back optimistic ui updates
  const originalRow = useRef<IProjectTileLayer>()
  // need to update rowState on blur because of
  // when user directly closes app after last update in field
  // seems that waiting for dexie update goes too long
  const rowState = useRef<IProjectTileLayer>()
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
      // console.log('ProjectTileLayer Form onBlur', { newValue, type, field })

      // return if value has not changed
      const previousValue = rowState.current[field]
      if (newValue === previousValue) return

      // if (showFilter) {
      //   return filter.setValue({
      //     table: 'project_tile_layer',
      //     key: field,
      //     value: newValue,
      //   })
      // }

      // update rowState
      rowState.current = { ...row, ...{ [field]: newValue } }
      // update dexie
      dexie.project_tile_layers.update(row.id, { [field]: newValue })
    },
    [row],
  )

  const [capabilitiesData, setCapabilitiesData] = useState()
  useEffect(() => {
    if (!row?.wms_base_url) return
    getCapabilitiesData({ wms_base_url: row.wms_base_url }).then(
      (capabilities) => setCapabilitiesData(capabilities),
    )
  }, [projectTileLayerId, row?.wms_base_url])

  const wmsFormatValues = capabilitiesData?.wmsFormatValues
  const layerOptions = capabilitiesData?.layerOptions
  const legendUrls = capabilitiesData?.legendUrls
  const infoFormatValues = capabilitiesData?.infoFormatValues

  useEffect(() => {
    if (!capabilitiesData?.capabilities) return
    setValuesFromCapabilities({
      capabilities: capabilitiesData?.capabilities,
      wms_format: row?.wms_format,
      wms_version: row?.wms_version,
      label: row?.label,
      wms_layers: row?.wms_layers,
      wms_queryable: row?.wms_queryable,
      wms_info_format: row?.wms_info_format,
      projectTileLayerId,
    })
  }, [
    capabilitiesData?.capabilities,
    row?.wms_format,
    row?.wms_version,
    row?.label,
    row?.wms_layers,
    row?.wms_queryable,
    row?.wms_info_format,
    projectTileLayerId,
  ])

  // const showDeleted = filter?.project_tile_layer?.deleted !== false || row?.deleted
  const showDeleted = false

  if (!row) return <Spinner />

  console.log('PTL Form rendering, capabilitiesData:', capabilitiesData)

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
                error={errors?.project_tile_layer?.deleted}
                disabled={!userMayEdit}
              />
            ) : (
              <Checkbox2States
                key={`${row.id}deleted/db`}
                label="gelöscht"
                name="deleted"
                value={row.deleted}
                onBlur={onBlur}
                error={errors?.project_tile_layer?.deleted}
                disabled={!userMayEdit}
              />
            )}
          </>
        )}
        <RadioButtonGroup
          key={`${row.id}type`}
          value={row.type}
          name="type"
          dataSource={tileLayerTypeValues}
          onBlur={onBlur}
          label="Typ"
          error={errors?.project_tile_layer?.type}
        />
        {row?.type === 'url_template' && (
          <TextField
            key={`${row.id}url_template`}
            name="url_template"
            label="URL-Vorlage"
            value={row.url_template}
            onBlur={onBlur}
            error={errors?.project_tile_layer?.url_template}
            disabled={!userMayEdit}
            type="text"
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
              error={errors?.project_tile_layer?.wms_base_url}
              disabled={!userMayEdit}
              type="text"
            />
            {!!row?.wms_base_url && (
              <>
                {wmsFormatValues?.length > 0 && (
                  <RadioButtonGroup
                    key={`${row.id}wms_format/cb`}
                    value={row.wms_format}
                    name="wms_format"
                    dataSource={wmsFormatValues}
                    onBlur={onBlur}
                    label="(Bild-)Format (welche der WMS-Server anbietet)"
                    helperText="Empfehlenswert ist 'image/png' (wenn vorhanden), weil es transparenten Hintergrund ermöglicht"
                    error={errors?.project_tile_layer?.wms_format}
                  />
                )}
                {wmsFormatValues?.length === 0 && (
                  <TextField
                    key={`${row.id}wms_format/text`}
                    name="wms_format"
                    label="(Bild-)Format"
                    value={row.wms_format}
                    onBlur={onBlur}
                    error={errors?.project_tile_layer?.wms_format}
                    disabled={!userMayEdit}
                  />
                )}
                {infoFormatValues?.length > 0 && (
                  <RadioButtonGroup
                    key={`${row.id}wms_info_format/cb`}
                    value={row.wms_info_format}
                    name="wms_info_format"
                    dataSource={infoFormatValues}
                    onBlur={onBlur}
                    label="Format der Informationen (welche der WMS-Server anbietet)"
                    helperText="Empfehlenswert ist 'application/vnd.ogc.gml' (wenn vorhanden) oder eine andere Form von gml, weil es die beste Darstellung ermöglicht"
                    error={errors?.project_tile_layer?.wms_info_format}
                  />
                )}
                {infoFormatValues?.length === 0 && (
                  <TextField
                    key={`${row.id}wms_info_format/text`}
                    name="wms_info_format"
                    label="Format der Informationen"
                    value={row.wms_info_format}
                    onBlur={onBlur}
                    error={errors?.project_tile_layer?.wms_info_format}
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
                {layerOptions?.length > 0 && (
                  <CheckboxGroup
                    key={`${row.id}wms_layers/cb`}
                    value={
                      row.wms_layers?.split ? row.wms_layers?.split?.(',') : []
                    }
                    label="Layer (welche der WMS-Server anbietet)"
                    name="wms_layers"
                    options={layerOptions}
                    onBlur={onBlur}
                  />
                )}
                {layerOptions?.length === 0 && (
                  <TextField
                    key={`${row.id}wms_layers/text`}
                    name="wms_layers"
                    label="Layer (wenn mehrere: mit Komma trennen. Beispiel: 'layer1,layer2')"
                    value={row.wms_layers}
                    onBlur={onBlur}
                    error={errors?.project_tile_layer?.wms_layers}
                    disabled={!userMayEdit}
                    multiLine
                  />
                )}
                {!row.wms_version && (
                  <TextField
                    key={`${row.id}wms_version`}
                    name="wms_version"
                    label="WMS-Version (wird automatisch ausgelesen)"
                    value={row.wms_version}
                    onBlur={onBlur}
                    error={errors?.project_tile_layer?.wms_version}
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
          error={errors?.project_tile_layer?.label}
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
          error={errors?.project_tile_layer?.sort}
          disabled={!userMayEdit}
          type="number"
        />
        <TextField
          key={`${row.id}max_zoom`}
          name="max_zoom"
          label="Maximale Zoom-Stufe"
          value={row.max_zoom}
          onBlur={onBlur}
          error={errors?.project_tile_layer?.max_zoom}
          disabled={!userMayEdit}
          type="number"
        />
        <TextField
          key={`${row.id}min_zoom`}
          name="min_zoom"
          label="Minimale Zoom-Stufe"
          value={row.min_zoom}
          onBlur={onBlur}
          error={errors?.project_tile_layer?.min_zoom}
          disabled={!userMayEdit}
          type="number"
        />
        <TextField
          key={`${row.id}opacity`}
          name="opacity"
          label="Deckkraft / Opazität (0 - 1)"
          value={row.opacity}
          onBlur={onBlur}
          error={errors?.project_tile_layer?.opacity}
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
        {!!legendUrls?.length && <Legends legendUrls={legendUrls} row={row} />}
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(ProjectTileLayerForm)
