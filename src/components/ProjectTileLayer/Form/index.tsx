import React, {
  useContext,
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import isEqual from 'lodash/isEqual'
import { Session } from '@supabase/supabase-js'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'
import Button from '@mui/material/Button'

import StoreContext from '../../../storeContext'
import Checkbox2States from '../../shared/Checkbox2States'
import CheckboxGroup from '../../shared/CheckboxGroup'
import JesNo from '../../shared/JesNo'
import ErrorBoundary from '../../shared/ErrorBoundary'
import {
  dexie,
  WmsVersionEnum,
  TileLayerTypeEnum,
  IProjectTileLayer,
  ProjectTileLayer,
} from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'
import TextField from '../../shared/TextField'
import Spinner from '../../shared/Spinner'
import RadioButtonGroup from '../../shared/RadioButtonGroup'
import Legends from './Legends'
import fetchWmsGetCapabilities from '../../../utils/fetchWmsGetCapabilities'

const FieldsContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`

type Props = {
  showFilter: (boolean) => void
}

// = '99999999-9999-9999-9999-999999999999'
const ProjectTileLayerForm = ({ showFilter }: Props) => {
  const { projectId, projectTileLayerId } = useParams()

  const store = useContext(StoreContext)
  const { filter, errors } = store

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

  // const data = {}
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

    return {
      row,
      userMayEdit,
    }
  }, [projectId, projectTileLayerId, session?.user?.email])

  const row: ProjectTileLayer = data?.row
  const userMayEdit: boolean = data?.userMayEdit

  const wmsVersionValues = Object.values(WmsVersionEnum).map((v) => ({
    value: v,
    label: v,
  }))
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
      console.log('ProjectTileLayer Form onBlur', { newValue, type, field })

      // return if value has not changed
      const previousValue = rowState.current[field]
      if (newValue === previousValue) return

      if (showFilter) {
        return filter.setValue({
          table: 'project_tile_layer',
          key: field,
          value: newValue,
        })
      }

      // update rowState
      rowState.current = { ...row, ...{ [field]: newValue } }
      // update dexie
      dexie.project_tile_layers.update(row.id, { [field]: newValue })
    },
    [filter, row, showFilter],
  )

  useEffect(() => {
    const run = async () => {
      if (row?.wms_base_url) {
        const upToDateRow = await dexie.project_tile_layers.get(
          projectTileLayerId,
        )
        const capabilities = await fetchWmsGetCapabilities(
          upToDateRow?.wms_base_url,
        )
        // console.log('ProjectTileLayerForm, capabilities:', capabilities)
        onBlur({ target: { name: 'wms_version', value: capabilities.version } })
        setWmsFormatValues(
          capabilities?.Capability?.Request?.GetMap?.Format.filter((v) =>
            v.toLowerCase().includes('image'),
          ).map((v) => ({
            label: v,
            value: v,
          })),
        )
        // TODO: set label with title?
        if (!upToDateRow.label) {
          onBlur({
            target: { name: 'label', value: capabilities?.Service?.Title },
          })
        }
        // TODO: let user choose from layers
        // capabilities.Capability?.Layer?.Layer
        // filter only layers with crs EPSG:4326
        // build tool to choose what layers. RadioButtonGroup?
        setLayerOptions(
          capabilities?.Capability?.Layer?.Layer?.filter((v) => true).map(
            (v) => ({
              label: `${v.Name} (${v.Title})`,
              value: v.Name,
            }),
          ),
        )

        // TODO: fetch legends from
        // Array: capabilities.Capability?.Layer?.Layer[this]?.Style?.LegendURL (filter image)
        // Then read OnlineResource

        // use capabilities.Capability?.Layer?.Layer[this]?.queryable to allow/disallow getting feature info?

        // TODO: use capabilities.Capability?.Request?.GetFeatureInfo?.Format
        // to set queryable and query_format
      }
    }
    run()
  }, [onBlur, row?.wms_base_url, projectTileLayerId])

  const [wmsFormatValues, setWmsFormatValues] = useState()
  const [layerOptions, setLayerOptions] = useState()
  console.log({ wmsFormatValues, layerOptions, wms_layers: row?.wms_layers })

  // const showDeleted = filter?.project_tile_layer?.deleted !== false || row?.deleted
  const showDeleted = false

  if (!row) return <Spinner />

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
                label="gelöscht"
                name="deleted"
                value={row.deleted}
                onBlur={onBlur}
                error={errors?.project_tile_layer?.deleted}
                disabled={!userMayEdit}
              />
            ) : (
              <Checkbox2States
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
        <TextField
          name="label"
          label="Beschriftung"
          value={row.label}
          onBlur={onBlur}
          error={errors?.project_tile_layer?.label}
          disabled={!userMayEdit}
        />
        <Checkbox2States
          label="aktiv"
          name="active"
          value={row.active}
          onBlur={onBlur}
          error={errors?.field?.active}
          disabled={!userMayEdit}
        />
        <TextField
          name="sort"
          label="Sortierung"
          value={row.sort}
          onBlur={onBlur}
          error={errors?.project_tile_layer?.sort}
          disabled={!userMayEdit}
          type="number"
        />
        <TextField
          name="max_zoom"
          label="Maximale Zoom-Stufe"
          value={row.max_zoom}
          onBlur={onBlur}
          error={errors?.project_tile_layer?.max_zoom}
          disabled={!userMayEdit}
          type="number"
        />
        <TextField
          name="min_zoom"
          label="Minimale Zoom-Stufe"
          value={row.min_zoom}
          onBlur={onBlur}
          error={errors?.project_tile_layer?.min_zoom}
          disabled={!userMayEdit}
          type="number"
        />
        <TextField
          name="opacity"
          label="Deckkraft / Opazität (0 - 1)"
          value={row.opacity}
          onBlur={onBlur}
          error={errors?.project_tile_layer?.opacity}
          disabled={!userMayEdit}
          type="number"
        />
        <Checkbox2States
          label="Grautöne statt Farben"
          name="greyscale"
          value={row.greyscale}
          onBlur={onBlur}
          error={errors?.field?.greyscale}
          disabled={!userMayEdit}
        />
        <RadioButtonGroup
          value={row.type}
          name="type"
          dataSource={tileLayerTypeValues}
          onBlur={onBlur}
          label="Typ"
          error={errors?.project_tile_layer?.type}
        />
        {row?.type === 'url_template' && (
          <TextField
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
              name="wms_base_url"
              label="Basis-URL"
              value={row.wms_base_url}
              onBlur={onBlur}
              error={errors?.project_tile_layer?.wms_base_url}
              disabled={!userMayEdit}
              type="text"
            />
            <TextField
              name="wms_format"
              label="(Bild-)Format"
              value={row.wms_format}
              onBlur={onBlur}
              error={errors?.project_tile_layer?.wms_format}
              disabled={!userMayEdit}
              type="text"
            />
            <Checkbox2States
              label="Transparent"
              name="wms_transparent"
              value={row.wms_transparent}
              onBlur={onBlur}
              error={errors?.field?.wms_transparent}
              disabled={!userMayEdit}
            />
            <CheckboxGroup
              value={row.wms_layers?.split ? row.wms_layers?.split?.(',') : []}
              label="Layer"
              name="wms_layers"
              options={layerOptions}
              onBlur={onBlur}
            />
            <TextField
              name="wms_layers"
              label="Layer (wenn mehrere: mit Komma trennen. Beispiel: 'layer1,layer2')"
              value={row.wms_layers}
              onBlur={onBlur}
              error={errors?.project_tile_layer?.wms_layers}
              disabled={!userMayEdit}
              multiLine
              type="text"
            />
            <TextField
              name="wms_version"
              label="WMS-Version (wird automatisch ausgelesen)"
              value={row.wms_version}
              onBlur={onBlur}
              error={errors?.project_tile_layer?.wms_version}
              disabled={true}
            />
            <Legends row={row} />
          </>
        )}
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(ProjectTileLayerForm)
