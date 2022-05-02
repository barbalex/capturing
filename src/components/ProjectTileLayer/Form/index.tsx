import React, { useContext, useEffect, useCallback, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import isEqual from 'lodash/isEqual'
import { Session } from '@supabase/supabase-js'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import StoreContext from '../../../storeContext'
import Checkbox2States from '../../shared/Checkbox2States'
import JesNo from '../../shared/JesNo'
import ErrorBoundary from '../../shared/ErrorBoundary'
import {
  dexie,
  WmsVersionEnum,
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

  console.log('ProjectTileLayerForm', { row })

  const wmsVersionValues = Object.values(WmsVersionEnum).map((v) => ({
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
                key={`${row.id}filterDeleted`}
                label="gelöscht"
                name="deleted"
                value={row.deleted}
                onBlur={onBlur}
                error={errors?.project_tile_layer?.deleted}
                disabled={!userMayEdit}
              />
            ) : (
              <Checkbox2States
                key={`${row.id}deleted`}
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
          key={`${row.id}label`}
          name="label"
          label="Beschriftung"
          value={row.label}
          onBlur={onBlur}
          error={errors?.project_tile_layer?.label}
          disabled={!userMayEdit}
        />
        <Select
          key={`${row.id}${row?.project_id ?? ''}project_id`}
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
          key={`${row?.id ?? ''}sort`}
          name="sort"
          label="Sortierung"
          value={row.sort}
          onBlur={onBlur}
          error={errors?.project_tile_layer?.sort}
          disabled={!userMayEdit}
          type="number"
        />
        <TextField
          key={`${row?.id ?? ''}url_template`}
          name="url_template"
          label="URL-Vorlage"
          value={row.url_template}
          onBlur={onBlur}
          error={errors?.project_tile_layer?.url_template}
          disabled={!userMayEdit}
          type="text"
        />
        <TextField
          key={`${row?.id ?? ''}max_zoom`}
          name="max_zoom"
          label="Maximale Zoom-Stufe"
          value={row.max_zoom}
          onBlur={onBlur}
          error={errors?.project_tile_layer?.max_zoom}
          disabled={!userMayEdit}
          type="number"
        />
        <TextField
          key={`${row?.id ?? ''}min_zoom`}
          name="min_zoom"
          label="Minimale Zoom-Stufe"
          value={row.min_zoom}
          onBlur={onBlur}
          error={errors?.project_tile_layer?.min_zoom}
          disabled={!userMayEdit}
          type="number"
        />
        <RadioButtonGroup
          value={row.wms_version}
          name="wms_version"
          dataSource={wmsVersionValues}
          onBlur={onBlur}
          label="WMS-Version"
          error={errors?.project_tile_layer?.wms_version}
        />
        <Checkbox2States
          label="Grautöne statt Farben"
          name="greyscale"
          value={row.greyscale}
          onBlur={onBlur}
          error={errors?.field?.greyscale}
          disabled={!userMayEdit}
        />
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(ProjectTileLayerForm)
