import React, {
  useContext,
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import isEqual from 'lodash/isEqual'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import StoreContext from '../../../storeContext'
import Checkbox2States from '../../shared/Checkbox2States'
import JesNo from '../../shared/JesNo'
import ErrorBoundary from '../../shared/ErrorBoundary'
import {
  dexie,
  IVectorLayer,
  Option,
  ProjectUser,
  VectorLayer,
  VectorLayerTypeEnum,
} from '../../../dexieClient'
import TextField from '../../shared/TextField'
import Spinner from '../../shared/Spinner'
import Select from '../../shared/Select'
import MultiSelect from '../../shared/MultiSelect'
import ToggleButtonGroup from '../../shared/ToggleButtonGroup'
import LayerStyle from '../../shared/LayerStyle'
import DownloadPVL from './DownloadPVL'
import constants from '../../../utils/constants'
import downloadWfs from '../../../utils/downloadWfs'
import getCapabilitiesDataForVectorLayer from './getCapabilitiesData'
import { IStore } from '../../../store'

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

interface Props {
  showFilter: () => void
}

// = '99999999-9999-9999-9999-999999999999'
const VectorLayerForm = ({ showFilter }: Props) => {
  const { projectId, vectorLayerId } = useParams()

  const store: IStore = useContext(StoreContext)
  const { filter, errors, rebuildTree, session } = store

  const unsetError = useCallback(
    () => () => {
      console.log('TODO: unsetError')
    },
    [],
  ) // TODO: add errors, unsetError in store
  useEffect(() => {
    unsetError('vector_layer')
  }, [vectorLayerId, unsetError])

  // const data = {}
  const data = useLiveQuery(async () => {
    const [row, projectUser]: [VectorLayer, ProjectUser] = await Promise.all([
      dexie.vector_layers.get(vectorLayerId),
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
  }, [projectId, vectorLayerId, session?.user?.email])

  const row = data?.row
  const userMayEdit = data?.userMayEdit

  // need original row to be able to roll back optimistic ui updates
  const originalRow = useRef<IVectorLayer>()
  // need to update rowState on blur because of
  // when user directly closes app after last update in field
  // seems that waiting for dexie update goes too long
  const rowState = useRef<IVectorLayer>()
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
    async (event: React.ChangeEvent) => {
      const { name: field, value, type, valueAsNumber } = event.target
      let newValue = type === 'number' ? valueAsNumber : value
      if ([undefined, '', NaN].includes(newValue)) newValue = null
      if (field === 'type_name') {
        newValue = value?.filter?.((v) => !!v)?.join(',')
      }

      // return if value has not changed
      const previousValue = rowState.current[field]
      if (newValue === previousValue) return

      if (showFilter) {
        return filter.setValue({
          table: 'vector_layer',
          key: field,
          value: newValue,
        })
      }

      // console.log('VectorLayer, onBlur', { field, value, newValue })

      // update rowState
      rowState.current = { ...row, ...{ [field]: newValue } }
      // update dexie
      dexie.vector_layers.update(row.id, { [field]: newValue })
      if (field === 'type_name') {
        console.log('re-downloading data', { field, value })
        if (value?.length) {
          downloadWfs({ pvl: rowState.current, store })
        } else {
          dexie.pvl_geoms.where({ deleted: 0, pvl_id: row.id }).delete()
        }
      }
      if (['label'].includes(field)) rebuildTree()
    },
    [filter, rebuildTree, row, showFilter, store],
  )

  const typeValues: Option[] = Object.values(VectorLayerTypeEnum).map((v) => {
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

  const [loadingCapabilities, setLoadingCapabilities] = useState<boolean>(false)
  useEffect(() => {
    // only set if url exists
    if (!row?.url) return
    // only set if not yet done
    if (row?.type_name) return
    setLoadingCapabilities(true)
    getCapabilitiesDataForVectorLayer({ row }).then(() =>
      setLoadingCapabilities(false),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row?.url, row?.type_name, vectorLayerId])

  // const showDeleted = filter?.vector_layer?.deleted !== false || row?.deleted
  const showDeleted = false

  // console.log('VectorLayer rendering', {
  //   row,
  //   loadingCapabilities,
  //   type_name: row?.type_name,
  //   _layerOptions: row?._layerOptions,
  // })

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
                error={errors?.vector_layer?.deleted}
                disabled={!userMayEdit}
              />
            ) : (
              <Checkbox2States
                key={`${row.id}deleted/cb`}
                label="gelöscht"
                name="deleted"
                value={row.deleted}
                onBlur={onBlur}
                error={errors?.vector_layer?.deleted}
                disabled={!userMayEdit}
              />
            )}
          </>
        )}
        <ToggleButtonGroup
          key={`${row.id}type`}
          value={row.type}
          name="type"
          dataSource={typeValues}
          onBlur={onBlur}
          label="Woher kommen die Daten?"
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
              error={errors?.vector_layer?.url}
              disabled={!userMayEdit}
              type="text"
            />
            {!!row.url && (
              <>
                {loadingCapabilities ? (
                  <Spinner />
                ) : (
                  <>
                    {row._layerOptions?.length > 0 && (
                      <MultiSelect
                        name="type_name"
                        value={row._layerOptions?.filter((o) =>
                          (
                            row.type_name?.split?.(',').filter((v) => v) ?? []
                          ).includes(o.value),
                        )}
                        field="type_name"
                        label="Layer"
                        options={row._layerOptions}
                        onBlur={onBlur}
                        helperText={
                          row._layerOptions?.length > 1
                            ? 'Sie können mehrere wählen'
                            : ''
                        }
                      />
                    )}
                    {[0, undefined].includes(row._layerOptions?.length) && (
                      <TextField
                        key={`${row.id}type_name`}
                        name="type_name"
                        label="Layer"
                        value={row.type_name}
                        onBlur={onBlur}
                        error={errors?.vector_layer?.type_name}
                        disabled={!userMayEdit}
                      />
                    )}
                    {!row.wfs_version && (
                      <TextField
                        key={`${row.id}wfs_version`}
                        name="wfs_version"
                        label="WFS Version (z.B. 2.0.0)"
                        value={row.wfs_version}
                        onBlur={onBlur}
                        error={errors?.vector_layer?.wfs_version}
                        disabled={!userMayEdit}
                      />
                    )}
                    {row._outputFormatOptions?.length > 0 && (
                      <Select
                        key={`${row.id}output_format/cb`}
                        name="output_format"
                        value={row.output_format}
                        field="output_format"
                        label="Daten-Format"
                        options={row._outputFormatOptions}
                        saveToDb={onBlur}
                        error={errors?.vector_layer?.output_format}
                        disabled={!userMayEdit}
                        helperText="JSON-Formate sind optimal, gml-Formate funktionieren nur zum Teil"
                      />
                    )}
                    {[0, undefined].includes(
                      row._outputFormatOptions?.length,
                    ) && (
                      <TextField
                        key={`${row.id}output_format`}
                        name="output_format"
                        label="Daten-Format"
                        value={row.output_format}
                        onBlur={onBlur}
                        error={errors?.vector_layer?.output_format}
                        disabled={!userMayEdit}
                        type="text"
                      />
                    )}
                  </>
                )}
              </>
            )}
            {!!row.url && (
              <>
                <TextField
                  key={`${row.id}label`}
                  name="label"
                  label="Beschriftung"
                  value={row.label}
                  onBlur={onBlur}
                  error={errors?.vector_layer?.label}
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
                  error={errors?.vector_layer?.sort}
                  disabled={!userMayEdit}
                  type="number"
                />
                <TextField
                  key={`${row.id}max_zoom`}
                  name="max_zoom"
                  label="Maximale Zoom-Stufe"
                  value={row.max_zoom}
                  onBlur={onBlur}
                  error={errors?.vector_layer?.max_zoom}
                  disabled={!userMayEdit}
                  type="number"
                />
                <TextField
                  key={`${row.id}min_zoom`}
                  name="min_zoom"
                  label="Minimale Zoom-Stufe"
                  value={row.min_zoom}
                  onBlur={onBlur}
                  error={errors?.vector_layer?.min_zoom}
                  disabled={!userMayEdit}
                  type="number"
                />
                <TextField
                  key={`${row.id}opacity`}
                  name="opacity"
                  label="Deckkraft / Opazität (0 - 1)"
                  value={row.opacity}
                  onBlur={onBlur}
                  error={errors?.vector_layer?.opacity}
                  disabled={!userMayEdit}
                  type="number"
                />
                <TextField
                  key={`${row.id}max_features`}
                  name="max_features"
                  label="Maximale Anzahl darzustellender Features"
                  value={row.max_features}
                  onBlur={onBlur}
                  error={errors?.vector_layer?.max_features}
                  disabled={!userMayEdit}
                  type="number"
                  helperText="Das Laden zu vieler Features überlastet Ihr Gerät"
                />
                <DownloadPVL key={`${row.id}downloadpvl`} row={row} />
              </>
            )}
          </>
        )}
        {!!row.url && <LayerStyle userMayEdit={userMayEdit} row={row} />}
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(VectorLayerForm)
