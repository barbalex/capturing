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

import StoreContext from '../../storeContext'
import ErrorBoundary from '../shared/ErrorBoundary'
import ConflictList from '../shared/ConflictList'
import {
  dexie,
  Row,
  IRow,
  Project,
  Field,
  IFieldType,
  IWidgetType,
  IProjectUser,
} from '../../dexieClient'
import { supabase } from '../../supabaseClient'
import TextField from '../shared/TextField'
import Select from '../shared/Select'
import Checkbox2States from '../shared/Checkbox2States'
import JesNo from '../shared/JesNo'
import RadioButtonGroup from '../shared/RadioButtonGroup'

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
  projectUser: IProjectUser
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
  // update originalRow only initially
  useEffect(() => {
    originalRow.current = row
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rowState = useRef<IRow>()
  const [label, setLabel] = useState<string>()
  // update originalRow only initially
  useEffect(() => {
    rowState.current = row
    row.label.then((v) => setLabel(v))
  }, [row])

  // console.log('RowForm rendering row:', { row, label })
  // TODO: build right queries
  const data: DataProps = useLiveQuery(async () => {
    const [fields, projectUser] = await Promise.all([
      dexie.fields.where({ deleted: 0, table_id: tableId }).toArray(),
      dexie.project_users.get({
        project_id: projectId,
        user_email: session?.user?.email,
      }),
    ])

    return {
      fields,
      projectUser,
    }
  }, [projectId, tableId, session?.user?.email])

  const fields: Field[] = data?.fields ?? []
  const userRole = data?.projectUser?.role
  const userMayEdit = ['project_manager', 'project_editor'].includes(userRole)

  // console.log('RowForm', { row, data: row?.data, fields })

  useEffect(() => {
    unsetError('row')
  }, [id, unsetError])

  const updateOnServer = useCallback(async () => {
    // only update if is changed
    if (!isEqual(originalRow.current, rowState.current)) {
      row.updateOnServer({ row: rowState.current, session })
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
      const previousValue = rowState.current[field]
      if (newValue === previousValue) return

      if (showFilter) {
        return filter.setValue({
          table: 'row',
          key: field,
          value: newValue,
        })
      }

      // TODO: build new data
      const newRow = { ...row, [field]: newValue }
      rowState.current = newRow
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
                value={row.deleted}
                onBlur={onBlur}
                error={errors?.row?.deleted}
              />
            ) : (
              <Checkbox2States
                key={`${row.id}deleted`}
                label="gelöscht"
                name="deleted"
                value={row.deleted}
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
                <FieldContainer key={f.id}>
                  <div>options-many</div>
                  <div>{JSON.stringify(f)}</div>
                </FieldContainer>
              )
              break
            case 'textarea':
              return (
                <FieldContainer key={f.id}>
                  <div>textarea</div>
                  <div>{JSON.stringify(f)}</div>
                </FieldContainer>
              )
              break
            case 'text':
            default:
              return (
                <TextField
                  key={f.id}
                  name={f.name}
                  label={f.label ?? f.name}
                  value={row.data?.[f.name] ?? ''}
                  onBlur={onBlur}
                  error={errors?.row?.[f.name]}
                  disabled={!userMayEdit}
                  type="text"
                />
                // <FieldContainer key={f.id}>
                //   <div>text</div>
                //   <div>{JSON.stringify(f)}</div>
                // </FieldContainer>
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
