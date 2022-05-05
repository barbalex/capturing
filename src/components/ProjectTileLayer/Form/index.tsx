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
import axios from 'redaxios'

import StoreContext from '../../../storeContext'
import Checkbox2States from '../../shared/Checkbox2States'
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
import Select from '../../shared/Select'
import Spinner from '../../shared/Spinner'
import RadioButtonGroup from '../../shared/RadioButtonGroup'
import sortProjectsByLabelName from '../../../utils/sortProjectsByLabelName'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'

const FieldsContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`

type Props = {
  showFilter: (boolean) => void
}
type valueType = {
  value: string
  label: string
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
    const [projects, row, projectUser] = await Promise.all([
      dexie.projects.where({ deleted: 0 }).sortBy('', sortProjectsByLabelName),
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
      projectsValues: projects.map((p) => ({
        value: p.id,
        label: labelFromLabeledTable({ object: p, useLabels: p.use_labels }),
      })),
      row,
      userMayEdit,
    }
  }, [projectId, projectTileLayerId, session?.user?.email])

  const projectsValues: valueType[] = data?.projectsValues ?? []
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

  console.log('ProjectTileLayer, row:', row)
  const [legends, setLegends] = useState()
  useEffect(() => {
    if (row?.type === 'wms') {
      // fetch legend for EACH layer
      // example: https://wms.zh.ch/FnsSVOZHWMS?service=WMS&VERSION=1.3.0&request=GetLegendGraphic&Layer=zonen-schutzverordnungen&format=png&sld_version=1.1.0
      const layers: string[] = row?.wms_layers.split(',') ?? []
      // console.log('legend getting effect, layers:', layers)

      const run = async () => {
        const legends = []
        for (const layer of layers) {
          const url = `${row?.wms_base_url}?service=WMS&VERSION=${row?.wms_version}&request=GetLegendGraphic&Layer=${layer}&format=png&sld_version=1.1.0`
          // console.log('legend getting effect, url:', url)
          let res
          try {
            res = await axios.get(url)
          } catch (error) {
            // error can also be caused by timeout
            console.log(`error fetching legend for layer '${layer}':`, error)
            return false
          }
          console.log('legend getting effect, got res:', res)
          let objectUrl
          try {
            objectUrl = URL.createObjectURL(
              new Blob([res.data] /*, { type: 'image/png' }*/),
            )
          } catch (error) {
            return console.log(
              `error creating objectUrl for legend for layer '${layer}'`,
              error,
            )
          }

          if (objectUrl) legends.push([layer, objectUrl])
        }

        console.log('legend getting effect, legends:', legends)
        setLegends(legends)
      }
      run()
    }
  }, [row])

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
        <Select
          name="project_id"
          value={row.project_id}
          field="project_id"
          label="Gehört zum Projekt"
          options={projectsValues}
          saveToDb={onBlur}
          error={errors?.project_tile_layer?.project_id}
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
            <TextField
              name="wms_layers"
              label="Layer (wenn mehrere: Komma-getrennt)"
              value={row.wms_layers}
              onBlur={onBlur}
              error={errors?.project_tile_layer?.wms_layers}
              disabled={!userMayEdit}
              multiLine
              type="text"
            />
            <TextField
              name="wms_parameters"
              label="Zusätzliche Parameter (Schreibweise für URL-Query)"
              value={row.wms_parameters}
              onBlur={onBlur}
              error={errors?.project_tile_layer?.wms_parameters}
              disabled={!userMayEdit}
              type="text"
            />
            <RadioButtonGroup
              value={row.wms_version}
              name="wms_version"
              dataSource={wmsVersionValues}
              onBlur={onBlur}
              label="WMS-Version"
              error={errors?.project_tile_layer?.wms_version}
            />
            <div>Legenden</div>
            {(legends ?? []).map((l) => {
              const title = l[0]
              const blob = l[1]
              console.log({ title, blob })

              return (
                <div key={title}>
                  <div>{title}</div>
                  {!!blob && <img height={50} src={blob} />}
                </div>
              )
            })}
          </>
        )}
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(ProjectTileLayerForm)
