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
import ErrorBoundary from '../../shared/ErrorBoundary'
import ConflictList from '../../shared/ConflictList'
import {
  dexie,
  Row,
  IRow,
  Project,
  Field,
  IFieldType,
  IWidgetType,
  IProjectUser,
} from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'
import TextField from '../../shared/TextField'
import Select from '../../shared/Select'
import Checkbox2States from '../../shared/Checkbox2States'
import JesNo from '../../shared/JesNo'
import RadioButtonGroup from '../../shared/RadioButtonGroup'
import OptionsMany from './OptionsMany'

const FieldsContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`
const CaseConflictTitle = styled.h4`
  margin-bottom: 10px;
`
const Rev = styled.span`
  font-weight: normal;
  padding-left: 7px;
  color: rgba(0, 0, 0, 0.4);
  font-size: 0.8em;
`
const FieldContainer = styled.div`
  border-bottom: 1px solid lightgrey;
`

type RowFormProps = {
  activeConflict: string
  id: string
  row: Row
  setActiveConflict: (string) => void
  showFilter: (boolean) => void
  showHistory: (boolean) => void
}

type DataProps = {
  fields: Field[]
  userMayEdit: boolean
}

const RowForm = ({
  activeConflict,
  id,
  row,
  setActiveConflict,
  showFilter,
  showHistory,
}: RowFormProps) => {
  const { tableId, projectId } = useParams()
  const store = useContext(StoreContext)
  const { filter, online, errors } = store
  const session: Session = supabase.auth.session()
  const unsetError = useCallback(
    () => () => {
      console.log('TODO: unsetError')
    },
    [],
  ) // TODO: add errors, unsetError in store

  const originalRow = useRef<IRow>()
  const originalData = useRef()
  // update originalRow only initially
  useEffect(() => {
    originalRow.current = row
    originalData.current = row.data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rowDataState = useRef<IRow>()
  // update originalRow only initially
  useEffect(() => {
    rowDataState.current = row.data
  }, [row])

  //console.log('RowForm rendering', { row, rowDataState: rowDataState.current })
  // TODO: build right queries
  const data: DataProps = useLiveQuery(async () => {
    const [fields, projectUser] = await Promise.all([
      dexie.fields.where({ deleted: 0, table_id: tableId }).toArray(),
      dexie.project_users.get({
        project_id: projectId,
        user_email: session?.user?.email,
      }),
    ])
    const userMayEdit = ['project_manager', 'project_editor'].includes(
      projectUser.role,
    )

    return {
      fields,
      userMayEdit,
    }
  }, [projectId, tableId, session?.user?.email])

  const fields: Field[] = data?.fields ?? []
  const userMayEdit = data?.userMayEdit

  console.log('RowForm', { row, data: row?.data, fields })

  useEffect(() => {
    unsetError('row')
  }, [id, unsetError])

  const updateOnServer = useCallback(async () => {
    // only update if is changed
    if (!isEqual(originalData.current, rowDataState.current)) {
      const newRow = {
        ...originalRow.current,
        data: rowDataState.current,
      }
      row.updateOnServer({ row: newRow, session })
    }
    return
  }, [row, session])

  useEffect(() => {
    window.onbeforeunload = async () => {
      // save any data changed before closing tab or browser
      await updateOnServer()
      return
    }
  }, [updateOnServer])

  const onBlur = useCallback(
    async (event) => {
      const { name: field, value, type, valueAsNumber } = event.target
      let newValue = type === 'number' ? valueAsNumber : value
      if ([undefined, '', NaN].includes(newValue)) newValue = null

      // only update if value has changed
      const previousValue = rowDataState.current?.[field]
      if (newValue === previousValue) return

      if (showFilter) {
        return filter.setValue({
          table: 'row',
          key: field,
          value: newValue,
        })
      }

      // build new data
      const oldData = row.data
      const newData =
        newValue === null && oldData === undefined
          ? null
          : { ...oldData, [field]: newValue }
      const newRow = { ...row, data: newData }
      rowDataState.current = newData
      dexie.rows.put(newRow)
    },
    [filter, row, showFilter],
  )

  // const showDeleted = filter?.row?.deleted !== false || row?.deleted
  const showDeleted = false

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
        {(activeConflict || showHistory) && (
          <CaseConflictTitle>
            Aktuelle Version<Rev>{row._rev}</Rev>
          </CaseConflictTitle>
        )}
        {showDeleted && (
          <>
            {showFilter ? (
              <JesNo
                key={`${row.id}deleted`}
                label="gelöscht"
                name="deleted"
                value={rowDataState.current.deleted}
                onBlur={onBlur}
                error={errors?.row?.deleted}
              />
            ) : (
              <Checkbox2States
                key={`${row.id}deleted`}
                label="gelöscht"
                name="deleted"
                value={rowDataState.current.deleted}
                onBlur={onBlur}
                error={errors?.row?.deleted}
              />
            )}
          </>
        )}
        <TextField
          key={`${row.id}id`}
          name="id"
          label="id"
          value={row.id}
          onBlur={onBlur}
          error={errors?.row?.id}
          disabled={true}
        />
        {fields.map((f) => {
          switch (f.widget_type) {
            case 'datepicker':
              return (
                <FieldContainer key={f.id}>
                  <div>datepicker</div>
                  <div>{JSON.stringify(f)}</div>
                </FieldContainer>
              )
              break
            case 'filepicker':
              return (
                <FieldContainer key={f.id}>
                  <div>filepicker</div>
                  <div>{JSON.stringify(f)}</div>
                </FieldContainer>
              )
              break
            case 'markdown':
              return (
                <FieldContainer key={f.id}>
                  <div>markdown</div>
                  <div>{JSON.stringify(f)}</div>
                </FieldContainer>
              )
              break
            case 'options-2':
              return (
                <FieldContainer key={f.id}>
                  <div>options-2</div>
                  <div>{JSON.stringify(f)}</div>
                </FieldContainer>
              )
              break
            case 'options-3':
              return (
                <FieldContainer key={f.id}>
                  <div>options-3</div>
                  <div>{JSON.stringify(f)}</div>
                </FieldContainer>
              )
              break
            case 'options-few':
              return (
                <FieldContainer key={f.id}>
                  <div>options-few</div>
                  <div>{JSON.stringify(f)}</div>
                </FieldContainer>
              )
              break
            case 'options-many':
              return (
                <OptionsMany
                  key={`${row.id}/${f.id}/options-many`}
                  field={f}
                  rowDataState={rowDataState.current}
                  onBlur={onBlur}
                  error={errors?.row?.[f.name]}
                  disabled={!userMayEdit}
                />
              )
              break
            case 'textarea':
              return (
                <TextField
                  key={`${row.id}/${f.id}/textarea`}
                  name={f.name}
                  label={f.label ?? f.name}
                  value={rowDataState.current?.[f.name] ?? ''}
                  onBlur={onBlur}
                  error={errors?.row?.[f.name]}
                  disabled={!userMayEdit}
                  type="text"
                  multiLine
                />
              )
              break
            case 'text':
              return (
                <TextField
                  key={`${row.id}/${f.id}/text`}
                  name={f.name}
                  label={f.label ?? f.name}
                  value={rowDataState.current?.[f.name] ?? ''}
                  onBlur={onBlur}
                  error={errors?.row?.[f.name]}
                  disabled={!userMayEdit}
                  type={f.field_type == 'text' ? 'text' : 'number'}
                />
              )
              break
            default:
              return (
                <TextField
                  key={`${row.id}/${f.id}/text`}
                  name={f.name}
                  label={f.label ?? f.name}
                  value={rowDataState.current?.[f.name] ?? ''}
                  onBlur={onBlur}
                  error={errors?.row?.[f.name]}
                  disabled={!userMayEdit}
                  type="text"
                />
              )
              break
          }
        })}

        {online && !showFilter && row?._conflicts?.map && (
          <ConflictList
            conflicts={row._conflicts}
            activeConflict={activeConflict}
            setActiveConflict={setActiveConflict}
          />
        )}
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(RowForm)
