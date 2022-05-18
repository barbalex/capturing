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
import CheckboxGroup from '../../shared/CheckboxGroup'
import LayerStyle from '../../LayerStyle'
import DownloadPVL from './DownloadPVL'
import getCapabilities from '../../../utils/getCapabilities'
import constants from '../../../utils/constants'

const FieldsContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`

const TitleRow = styled.div`
  margin: 0 -10px 15px -10px;
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
      if (type === 'array' && field === 'type_name') {
        newValue = value.filter((v) => !!v).join(',')
      }

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

      // console.log('ProjectVectorLayer, onBlur', { field, value, newValue })

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
        ? 'Web-Feature-Service verwenden'
        : v === 'upload'
        ? 'Eigene Features importieren'
        : ''

    return {
      value: v,
      label: comment,
    }
  })

  const [loadingCapabilities, setLoadingCapabilities] = useState(true)
  const [wfsVersion, setWfsVersion] = useState()
  const [outputFormatValues, setOutputFormatValues] = useState()
  const [layerOptions, setLayerOptions] = useState()
  useEffect(() => {
    const run = async () => {
      if (!row?.url) return

      const upToDateRow: ProjectVectorLayer =
        await dexie.project_vector_layers.get(projectVectorLayerId)
      let response
      try {
        response = await getCapabilities({
          url: upToDateRow?.url,
          service: 'WFS',
        })
      } catch (error) {
        // TODO: surface this error
        console.log({
          url: error?.url,
          error,
          status: error?.status,
          statusText: error?.statusText,
          data: error?.data,
          type: error?.type,
        })
      }
      setLoadingCapabilities(false)

      // console.log('ProjectVectorLayerForm, effect, responce:', response)
      const capabilities = response?.HTML?.BODY?.['WFS:WFS_CAPABILITIES']
      console.log('ProjectVectorLayerForm, effect, capabilities:', capabilities)

      // 1. wfs version
      const _wfsVersion = capabilities?.['@attributes']?.version
      if (_wfsVersion) {
        setWfsVersion(_wfsVersion)
        if (!upToDateRow.wfs_version) {
          onBlur({
            target: { name: 'wfs_version', value: _wfsVersion },
          })
        }
      }

      // 2. output formats
      const _operations =
        capabilities?.['OWS:OPERATIONSMETADATA']?.['OWS:OPERATION'] ?? []
      const getFeatureOperation = _operations.find(
        (o) => o?.['@attributes']?.name === 'GetFeature',
      )
      const _outputFormats = (
        getFeatureOperation?.['OWS:PARAMETER']?.['OWS:ALLOWEDVALUES']?.[
          'OWS:VALUE'
        ] ?? []
      ).map((v) => v?.['#text'])
      const acceptableOutputFormats = _outputFormats.filter((v) =>
        v?.toLowerCase?.()?.includes('json'),
      )
      let preferredOutputFormat
      if (acceptableOutputFormats.length) {
        preferredOutputFormat =
          acceptableOutputFormats.filter((v) =>
            v.toLowerCase().includes('geojson'),
          )[0] ??
          acceptableOutputFormats.filter((v) =>
            v.toLowerCase().includes('application/json'),
          )[0] ??
          acceptableOutputFormats[0]
        setOutputFormatValues(
          acceptableOutputFormats.map((v) => ({ label: v, value: v })),
        )
        if (!upToDateRow.output_format) {
          // set preferred value if upToDateRow.output_format is empty
          onBlur({
            target: {
              name: 'output_format',
              value: preferredOutputFormat,
            },
          })
        }
      }

      // 3. label
      const _label =
        capabilities?.['OWS:SERVICEIDENTIFICATION']?.['OWS:TITLE']?.['#text']
      if (!upToDateRow.label && !!_label) {
        onBlur({
          target: {
            name: 'label',
            value: _label,
          },
        })
      }

      // 4. layers
      let layers = capabilities?.FEATURETYPELIST?.FEATURETYPE ?? []
      // this value can be array OR object!!!
      if (!Array.isArray(layers)) layers = [layers]
      const _layerOptions = layers
        .filter(
          (l) =>
            l.OTHERCRS?.map((o) => o?.['#text']?.includes('EPSG:4326')) ||
            l.DefaultCRS?.map((o) => o?.['#text']?.includes('EPSG:4326')),
        )
        .filter((l) =>
          preferredOutputFormat
            ? l.OUTPUTFORMATS?.FORMAT?.map((f) => f?.['#text'])?.includes(
                preferredOutputFormat,
              )
            : true,
        )
        .map((v) => ({
          label: v.TITLE?.['#text'] ?? v.NAME?.['#text'],
          value: v.NAME?.['#text'],
        }))
      setLayerOptions(_layerOptions)
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
        <RadioButtonGroup
          key={`${row.id}type`}
          name="type"
          value={row.type}
          field="type"
          label="Woher kommen die Daten?"
          dataSource={typeValues}
          onBlur={onBlur}
          error={errors?.field?.type}
          disabled={!userMayEdit}
        />
        {row.type === 'wfs' && (
          <>
            <TitleRow>
              <Title>WFS konfigurieren</Title>
            </TitleRow>
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
            {loadingCapabilities ? (
              <Spinner />
            ) : (
              <>
                {layerOptions?.length > 0 && (
                  <CheckboxGroup
                    key={`${row.id}type_name/cb`}
                    value={
                      row.type_name?.split ? row.type_name?.split?.(',') : []
                    }
                    label="Layer (welche der WFS-Server anbietet)"
                    name="type_name"
                    options={layerOptions}
                    onBlur={onBlur}
                    disabled={!userMayEdit}
                  />
                )}
                {layerOptions?.length === 0 && (
                  <TextField
                    key={`${row.id}type_name`}
                    name="type_name"
                    label="Layer (welche der WFS-Server anbietet)"
                    value={row.type_name}
                    onBlur={onBlur}
                    error={errors?.project_vector_layer?.type_name}
                    disabled={!userMayEdit}
                  />
                )}
                {!wfsVersion && (
                  <TextField
                    key={`${row.id}wfs_version`}
                    name="wfs_version"
                    label="WFS Version (z.B. 2.0.0)"
                    value={row.wfs_version}
                    onBlur={onBlur}
                    error={errors?.project_vector_layer?.wfs_version}
                    disabled={!userMayEdit}
                  />
                )}
                {outputFormatValues?.length > 0 && (
                  <RadioButtonGroup
                    key={`${row.id}output_format/cb`}
                    value={row.output_format}
                    name="output_format"
                    dataSource={outputFormatValues}
                    onBlur={onBlur}
                    label="Daten-Format"
                    helperText="Nur JSON-Formate können verwendet werden"
                    error={errors?.project_tile_layer?.output_format}
                  />
                )}
                {outputFormatValues?.length === 0 && (
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
            <DownloadPVL key={`${row.id}downloadpvl`} row={row} />
          </>
        )}
        <LayerStyle userMayEdit={userMayEdit} />
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(ProjectVectorLayerForm)
