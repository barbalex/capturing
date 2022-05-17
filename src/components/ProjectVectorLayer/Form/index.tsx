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

import StoreContext from '../../../storeContext'
import Checkbox2States from '../../shared/Checkbox2States'
import RadioButtonGroup from '../../shared/RadioButtonGroup'
import JesNo from '../../shared/JesNo'
import ErrorBoundary from '../../shared/ErrorBoundary'
import {
  dexie,
  IProjectVectorLayer,
  ProjectVectorLayer,
  VectorLayerTypeEnum,
} from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'
import TextField from '../../shared/TextField'
import Spinner from '../../shared/Spinner'
import LayerStyle from '../../LayerStyle'
import DownloadPVL from './DownloadPVL'
import getCapabilities from '../../../utils/getCapabilities'

const FieldsContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`

type Props = {
  showFilter: (boolean) => void
}

// = '99999999-9999-9999-9999-999999999999'
const ProjectVectorLayerForm = ({ showFilter }: Props) => {
  const { projectId, projectVectorLayerId } = useParams()

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
    unsetError('project_vector_layer')
  }, [projectVectorLayerId, unsetError])

  // const data = {}
  const data = useLiveQuery(async () => {
    const [row, projectUser] = await Promise.all([
      dexie.project_vector_layers.get(projectVectorLayerId),
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
  }, [projectId, projectVectorLayerId, session?.user?.email])

  const row: ProjectVectorLayer = data?.row
  const userMayEdit: boolean = data?.userMayEdit

  // need original row to be able to roll back optimistic ui updates
  const originalRow = useRef<IProjectVectorLayer>()
  // need to update rowState on blur because of
  // when user directly closes app after last update in field
  // seems that waiting for dexie update goes too long
  const rowState = useRef<IProjectVectorLayer>()
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
          table: 'project_vector_layer',
          key: field,
          value: newValue,
        })
      }

      // update rowState
      rowState.current = { ...row, ...{ [field]: newValue } }
      // update dexie
      dexie.project_vector_layers.update(row.id, { [field]: newValue })
    },
    [filter, row, showFilter],
  )

  const typeValues = Object.values(VectorLayerTypeEnum).map((v) => {
    const comment =
      v === 'wfs'
        ? '       ein existierendes Web-Feature-Service verwenden'
        : v === 'upload'
        ? ' eigene Features importieren'
        : ''

    return {
      value: v,
      label: `${v}: ${comment}`,
    }
  })

  const [wfsVersion, setWfsVersion] = useState()
  useEffect(() => {
    const run = async () => {
      //TODO:
      if (!row?.url) return
      const upToDateRow: ProjectVectorLayer =
        await dexie.project_vector_layers.get(projectVectorLayerId)
      const responce = await getCapabilities({
        url: upToDateRow?.url,
        service: 'WFS',
      })
      const capabilities = responce?.HTML?.BODY?.['WFS:WFS_CAPABILITIES']
      console.log('ProjectVectorLayerForm, effect, capabilities:', capabilities)
      console.log(
        'ProjectVectorLayerForm, effect, wfsVersion:',
        capabilities?.['@attributes']?.version,
      )
      const _wfsVersion = capabilities?.['@attributes']?.version
      if (_wfsVersion) {
        setWfsVersion(_wfsVersion)
        if (!upToDateRow.wfs_version) {
          onBlur({
            target: { name: 'wfs_version', value: _wfsVersion },
          })
        }
      }
    }
    run()
  }, [onBlur, projectVectorLayerId, row])

  // const showDeleted = filter?.project_vector_layer?.deleted !== false || row?.deleted
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
                key={`${row.id}deleted/jesno`}
                label="gelöscht"
                name="deleted"
                value={row.deleted}
                onBlur={onBlur}
                error={errors?.project_vector_layer?.deleted}
                disabled={!userMayEdit}
              />
            ) : (
              <Checkbox2States
                key={`${row.id}deleted/cb`}
                label="gelöscht"
                name="deleted"
                value={row.deleted}
                onBlur={onBlur}
                error={errors?.project_vector_layer?.deleted}
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
          error={errors?.project_vector_layer?.label}
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
          error={errors?.project_vector_layer?.sort}
          disabled={!userMayEdit}
          type="number"
        />
        <TextField
          key={`${row.id}max_zoom`}
          name="max_zoom"
          label="Maximale Zoom-Stufe"
          value={row.max_zoom}
          onBlur={onBlur}
          error={errors?.project_vector_layer?.max_zoom}
          disabled={!userMayEdit}
          type="number"
        />
        <TextField
          key={`${row.id}min_zoom`}
          name="min_zoom"
          label="Minimale Zoom-Stufe"
          value={row.min_zoom}
          onBlur={onBlur}
          error={errors?.project_vector_layer?.min_zoom}
          disabled={!userMayEdit}
          type="number"
        />
        <TextField
          key={`${row.id}opacity`}
          name="opacity"
          label="Deckkraft / Opazität (0 - 1)"
          value={row.opacity}
          onBlur={onBlur}
          error={errors?.project_vector_layer?.opacity}
          disabled={!userMayEdit}
          type="number"
        />
        <RadioButtonGroup
          key={`${row.id}type`}
          name="type"
          value={row.type}
          field="type"
          label="Typ: Woher kommen die Geometrien?"
          dataSource={typeValues}
          onBlur={onBlur}
          error={errors?.field?.type}
          disabled={!userMayEdit}
        />
        {row.type === 'wfs' && (
          <>
            <TextField
              key={`${row.id}url`}
              name="url"
              label="URL"
              value={row.url}
              onBlur={onBlur}
              error={errors?.project_vector_layer?.url}
              disabled={!userMayEdit}
              type="text"
            />
            <TextField
              key={`${row.id}type_name`}
              name="type_name"
              label="Type Name"
              value={row.type_name}
              onBlur={onBlur}
              error={errors?.project_vector_layer?.type_name}
              disabled={!userMayEdit}
              type="text"
            />
            <TextField
              key={`${row.id}wfs_version`}
              name="wfs_version"
              label="WFS Version (z.B. 2.0.0)"
              value={row.wfs_version}
              onBlur={onBlur}
              error={errors?.project_vector_layer?.wfs_version}
              disabled={!userMayEdit}
              type="text"
            />
            <TextField
              key={`${row.id}output_format`}
              name="output_format"
              label="Format (GeoJSON wählen)"
              value={row.output_format}
              onBlur={onBlur}
              error={errors?.project_vector_layer?.output_format}
              disabled={!userMayEdit}
              type="text"
            />
            <DownloadPVL key={`${row.id}downloadpvl`} row={row} />
          </>
        )}
        <LayerStyle userMayEdit={userMayEdit} />
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(ProjectVectorLayerForm)
