import React, { useContext, useEffect, useCallback, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import isEqual from 'lodash/isEqual'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import StoreContext from '../../../storeContext'
import ErrorBoundary from '../../shared/ErrorBoundary'
import ConflictList from '../../shared/ConflictList'
import { dexie, Row, IRow, Field } from '../../../dexieClient'
import TextField from '../../shared/TextField'
import Date from '../../shared/Date'
import Time from '../../shared/Time'
import Checkbox2States from '../../shared/Checkbox2States'
import JesNo from '../../shared/JesNo'
import JesNoNull from '../../shared/JesNoNull'
import RichText from '../../shared/RichText'
import OptionsMany from './OptionsMany'
import OptionsFew from './OptionsFew'
import Files from './Files'

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
}

const RowForm = ({
  activeConflict,
  id,
  row,
  setActiveConflict,
  showFilter,
}: RowFormProps) => {
  const params = useParams()
  const tableId = params?.tableId ?? '99999999-9999-9999-9999-999999999999'
  const projectId = params?.projectId ?? '99999999-9999-9999-9999-999999999999'
  const url = params['*']
  const showHistory = url?.endsWith('history')
  const store = useContext(StoreContext)
  const { filter, online, errors, rebuildTree, session } = store

  const unsetError = useCallback(
    () => () => {
      console.log('TODO: unsetError')
    },
    [],
  )

  // TODO: add errors, unsetError in store
  useEffect(() => {
    unsetError('row')
  }, [id, unsetError])

  console.log('RowForm', {
    row,
    tableId,
    projectId,
    sessionUserEmail: session?.user?.email,
  })

  const originalRow = useRef<IRow>()
  const rowState = useRef<IRow>()
  useEffect(() => {
    if (!originalRow.current && row) {
      // console.log('RowForm, setting originalRow to:', row)
      originalRow.current = row
      rowState.current = row
    }
  }, [row])

  // TODO: build right queries
  const data = useLiveQuery(async () => {
    // TODO:
    // Getting error when running:
    // Failed to execute 'get' on 'IDBObjectStore': No key or key range specified
    // caused by first query, dexie.fields.where
    const [fields, projectUser, table] = await Promise.all([
      dexie.fields.where({ deleted: 0, table_id: tableId }).sortBy('sort'),
      dexie.project_users.get({
        project_id: projectId,
        user_email: session?.user?.email ?? 'none',
      }),
      dexie.ttables.get(tableId),
    ])
    console.log('RowForm, liveQuery', {
      fields,
      projectUser,
      table,
    })
    const userMayEdit = [
      'account_manager',
      'project_manager',
      'project_editor',
    ].includes(projectUser?.role)

    const labelFields = (table?.row_label ?? [])
      .filter((l) => !!l.field)
      .map((l) => l.field)
    const fieldsofLabelFields = await dexie.fields.bulkGet(labelFields)
    const labelFieldNames = fieldsofLabelFields.map((f) => f.name)

    return {
      fields,
      userMayEdit,
      labelFieldNames,
    }
  }, [projectId, tableId, session?.user?.email])

  const fields: Field[] = data?.fields ?? []
  const userMayEdit: boolean = data?.userMayEdit
  const labelFieldNames = data?.labelFieldNames

  const updateOnServer = useCallback(async () => {
    console.log('RowForm, updateOnServer, called', {
      originalRowData: originalRow.current?.data,
      rowStateData: rowState.current.data,
    })
    // only update if is changed
    if (isEqual(originalRow.current.data, rowState.current.data)) return

    console.log('RowForm, updateOnServer, setting row to:', rowState.current)

    row.updateOnServer({
      was: originalRow.current,
      is: rowState.current,
      session,
    })
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

      console.log('RowForm, onBlur', {
        field,
        value,
        type,
        valueAsNumber,
        newValue,
      })

      // only update if value has changed
      const previousValue = row?.data?.[field]
      if (newValue === previousValue) return

      if (showFilter) {
        return filter.setValue({
          table: 'row',
          key: field,
          value: newValue,
        })
      }

      // build new data
      let newData
      const oldData = row.data
      if (oldData === null) {
        if (newValue === null) {
          newData = null
        } else {
          newData = { [field]: newValue }
        }
      } else {
        newData = { ...oldData, [field]: newValue }
      }

      rowState.current = { ...row, data: newData }
      console.log('RowForm, onBlur, rowState set:', rowState.current)
      await dexie.rows.update(row.id, { data: newData })
      console.log('RowForm, onBlur, newData written to dexie:', newData)
      // rebuildTree if field is part of label
      if (labelFieldNames.includes(field)) rebuildTree()
    },
    [filter, labelFieldNames, rebuildTree, row, showFilter],
  )

  // const showDeleted = filter?.row?.deleted !== false || row?.deleted
  const showDeleted = false
  // console.log('RowForm rendering, row:', { row })

  // console.log('RowForm, row:', row)

  return (
    <ErrorBoundary>
      <FieldsContainer
        onBlur={(e) => {
          // https://github.com/facebook/react/issues/6410#issuecomment-671915381
          // console.log('FieldsContainer onBlur')
          if (!e.currentTarget.contains(e.relatedTarget)) {
            // focus left the container
            console.log('Row FieldsContainer focusleave')
            updateOnServer()
          }
          // if (e.currentTarget === e.target) {
          //   console.log('FieldsContainer blur (self)')
          // }
        }}
      >
        {(activeConflict || showHistory) && (
          <CaseConflictTitle>
            Aktuelle Version<Rev>{row.rev}</Rev>
          </CaseConflictTitle>
        )}
        {showDeleted && (
          <>
            {showFilter ? (
              <JesNo
                key={`${row.id}deleted`}
                label="gelöscht"
                name="deleted"
                value={row.data.deleted}
                onBlur={onBlur}
                error={errors?.row?.deleted}
              />
            ) : (
              <Checkbox2States
                key={`${row.id}deleted`}
                label="gelöscht"
                name="deleted"
                value={row.data.deleted}
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
        {!fields?.length && (
          <p>Für diese Tabelle wurden noch keine Felder definiert.</p>
        )}
        <TextField
          key={`${row.id}geometry`}
          name="geometry"
          label="geometry"
          value={JSON.stringify(row.geometry)}
          onBlur={() => console.log('TODO:')}
          error={errors?.row?.geometry}
          disabled={true}
          multiLine
        />
        {fields.map((f) => {
          switch (f.widget_type) {
            case 'datepicker':
              return (
                <Date
                  key={`${row.id}/${f.id}/datepicker`}
                  value={row.data?.[f.name] ?? ''}
                  label={f.label ?? f.name}
                  name={f.name}
                  saveToDb={onBlur}
                  error={errors?.row?.[f.name]}
                />
              )
              break
            case 'datetimepicker':
              return (
                <Date
                  key={`${row.id}/${f.id}/datetimepicker`}
                  value={row.data?.[f.name] ?? ''}
                  label={f.label ?? f.name}
                  name={f.name}
                  saveToDb={onBlur}
                  error={errors?.row?.[f.name]}
                  showTimeSelect={true}
                />
              )
              break
            case 'timepicker':
              return (
                <Time
                  key={`${row.id}/${f.id}/timepicker`}
                  value={row.data?.[f.name] ?? ''}
                  label={f.label ?? f.name}
                  name={f.name}
                  saveToDb={onBlur}
                  error={errors?.row?.[f.name]}
                />
              )
              break
            case 'filepicker': // TODO:
              return <Files key={f.id} field={f} />
              break
            case 'markdown': // TODO:
              return (
                <FieldContainer key={f.id}>
                  <div>Sorry, markdown field is not yet implemented</div>
                </FieldContainer>
              )
              break
            case 'options-2':
              return (
                <Checkbox2States
                  key={`${row.id}/${f.id}/options2`}
                  label={f.label ?? f.name}
                  name={f.name}
                  value={row.data?.[f.name] ?? ''}
                  onBlur={onBlur}
                  error={errors?.row?.[f.name]}
                />
              )
              break
            case 'jes-no':
              return (
                <JesNo
                  key={`${row.id}/${f.id}/jesno`}
                  label={f.label ?? f.name}
                  name={f.name}
                  value={row.data?.[f.name] ?? ''}
                  onBlur={onBlur}
                  error={errors?.row?.[f.name]}
                />
              )
              break
            case 'options-3':
              return (
                <JesNoNull
                  key={`${row.id}/${f.id}/jesnonull`}
                  label={f.label ?? f.name}
                  name={f.name}
                  value={row.data?.[f.name] ?? ''}
                  onBlur={onBlur}
                  error={errors?.row?.[f.name]}
                />
              )
              break
            case 'options-few':
              return (
                <OptionsFew
                  key={`${row.id}/${f.id}/options-few`}
                  field={f}
                  rowState={row}
                  onBlur={onBlur}
                  error={errors?.row?.[f.name]}
                  disabled={!userMayEdit}
                />
              )
              break
            case 'options-many':
              return (
                <OptionsMany
                  key={`${row.id}/${f.id}/options-many`}
                  field={f}
                  rowState={row}
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
                  value={row.data?.[f.name] ?? ''}
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
                  value={row.data?.[f.name] ?? ''}
                  onBlur={onBlur}
                  error={errors?.row?.[f.name]}
                  disabled={!userMayEdit}
                  type={f.field_type == 'text' ? 'text' : 'number'}
                />
              )
              break
            case 'rich-text':
              return (
                <RichText
                  key={`${row.id}/${f.id}/rich-text/${
                    row.data?.[f.name] ? JSON.stringify(row.data?.[f.name]) : ''
                  }`}
                  name={f.name}
                  label={f.label ?? f.name}
                  value={row.data?.[f.name] ?? ''}
                  onBlur={onBlur}
                  error={errors?.row?.[f.name]}
                  disabled={!userMayEdit}
                />
              )
              break
            default:
              return (
                <TextField
                  key={`${row.id}/${f.id}/text`}
                  name={f.name}
                  label={f.label ?? f.name}
                  value={row.data?.[f.name] ?? ''}
                  onBlur={onBlur}
                  error={errors?.row?.[f.name]}
                  disabled={!userMayEdit}
                  type="text"
                />
              )
              break
          }
        })}
        {online && !showFilter && row?.conflicts?.map && (
          <ConflictList
            key={`${row.id}/conflicts`}
            conflicts={row.conflicts}
            activeConflict={activeConflict}
            setActiveConflict={setActiveConflict}
          />
        )}
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(RowForm)
