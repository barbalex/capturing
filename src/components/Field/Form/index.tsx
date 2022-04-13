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
  IField,
  Field,
  IFieldType,
  IWidgetType,
  Project,
  IProjectUser,
  Table,
} from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'
import TextField from '../../shared/TextField'
import Select from '../../shared/Select'
import RadioButtonGroup from '../../shared/RadioButtonGroup'
import sortByLabelName from '../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'

const FieldsContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`

type FieldFormProps = {
  id: string
  row: Field
  showFilter: (boolean) => void
}
type DataProps = {
  project: Project
  projects: Project[]
  fields: Field[]
  optionsTable: Table
  projectUser: IProjectUser
}

// = '99999999-9999-9999-9999-999999999999'
const TableForm = ({ id, row, showFilter }: FieldFormProps) => {
  const { projectId, tableId } = useParams()
  const store = useContext(StoreContext)
  const { filter, errors } = store
  const session: Session = supabase.auth.session()
  const unsetError = useCallback(
    () => () => {
      console.log('TODO: unsetError')
    },
    [],
  ) // TODO: add errors, unsetError in store

  // const data = {}
  const data: DataProps = useLiveQuery(async () => {
    const [
      project,
      optionsTables,
      fields,
      fieldTypes,
      widgetTypes,
      projectUser,
    ] = await Promise.all([
      dexie.projects.where({ id: projectId }).first(),
      dexie.ttables
        .filter(
          (t) =>
            t.deleted === 0 &&
            t.project_id === projectId &&
            ['value_list', 'id_value_list'].includes(t.type),
        )
        .toArray(),
      dexie.fields.where({ deleted: 0, table_id: tableId }).toArray(),
      dexie.field_types.where({ deleted: 0 }).toArray(),
      dexie.widget_types.where({ deleted: 0 }).toArray(),
      dexie.project_users
        .where({
          project_id: projectId,
          user_email: session?.user?.email,
        })
        .first(),
    ])

    return {
      project,
      optionsTables,
      fields,
      fieldTypes,
      widgetTypes,
      projectUser,
    }
  }, [projectId, row?.parent_id, session?.user?.email])
  const project = data?.project
  const optionsTables = sortByLabelName({
    objects: data?.optionsTables ?? [],
    useLabels: row.use_labels,
  })
  const fields: Field[] = sortByLabelName({
    objects: data?.fields ?? [],
    useLabels: row.use_labels,
  })
  const fieldTypes: IFieldType = data?.fieldTypes ?? []
  const widgetTypes: IWidgetType = data?.widgetTypes ?? []
  const userRole = data?.projectUser?.role
  const userMayEdit = userRole === 'project_manager'

  const optionsTableSelectValues = optionsTables.map((t) => ({
    value: t.id,
    label: labelFromLabeledTable({ object: t, useLabels: project.use_labels }),
  }))
  const fieldTypeValues = fieldTypes
    .map((t) => ({
      value: t.value,
      label: t.value,
    }))
    .sort((a, b) => {
      const aVal = a.sort ?? a.value
      const bVal = b.sort ?? b.value

      if (aVal < bVal) return -1
      if (aVal === bVal) return 0
      return 1
    })
  const widgetTypeValues = widgetTypes
    .map((t) => ({
      value: t.value,
      label: t.value,
    }))
    .sort((a, b) => {
      const aVal = a.sort ?? a.value
      const bVal = b.sort ?? b.value

      if (aVal < bVal) return -1
      if (aVal === bVal) return 0
      return 1
    })

  // console.log('FieldForm', {
  //   row,
  // })

  const originalRow = useRef<IField>()
  // update originalRow only initially
  useEffect(() => {
    originalRow.current = row
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rowState = useRef<IField>()
  // update originalRow only initially
  useEffect(() => {
    rowState.current = row
  }, [row])

  useEffect(() => {
    unsetError('table')
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
          table: 'field',
          key: field,
          value: newValue,
        })
      }

      const newRow = { ...row, [field]: newValue }
      rowState.current = newRow
      dexie.fields.put(newRow)
    },
    [filter, row, showFilter],
  )

  // const showDeleted = filter?.table?.deleted !== false || row?.deleted
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
        {showDeleted && (
          <>
            {showFilter ? (
              <JesNo
                key={`${row.id}filterDeleted`}
                label="gelöscht"
                name="deleted"
                value={row.deleted}
                onBlur={onBlur}
                error={errors?.field?.deleted}
                disabled={!userMayEdit}
              />
            ) : (
              <Checkbox2States
                key={`${row.id}deleted`}
                label="gelöscht"
                name="deleted"
                value={row.deleted}
                onBlur={onBlur}
                error={errors?.field?.deleted}
                disabled={!userMayEdit}
              />
            )}
          </>
        )}
        <TextField
          key={`${row.id}name`}
          name="name"
          label="Name"
          value={row.name}
          onBlur={onBlur}
          error={errors?.field?.name}
          disabled={!userMayEdit}
        />
        <Checkbox2States
          key={`${row.id}use_labels`}
          label="Zusätzlich zu Namen Beschriftungen verwenden"
          name="use_labels"
          value={row.use_labels}
          onBlur={onBlur}
          error={errors?.field?.use_labels}
          disabled={!userMayEdit}
        />
        {row.use_labels === 1 && (
          <TextField
            key={`${row.id}label`}
            name="label"
            label="Beschriftung"
            value={row.label}
            onBlur={onBlur}
            error={errors?.field?.label}
            disabled={!userMayEdit}
          />
        )}
        <TextField
          key={`${row?.id ?? ''}sort`}
          name="sort"
          label="Sortierung"
          value={row.sort}
          onBlur={onBlur}
          error={errors?.field?.sort}
          disabled={!userMayEdit}
          type="number"
        />
        <JesNo
          key={`${row.id}is_internal_id`}
          label="Dieses Feld wird von Ihnen als ID verwendet"
          name="is_internal_id"
          value={row.is_internal_id}
          onBlur={onBlur}
          error={errors?.field?.is_internal_id}
          disabled={!userMayEdit}
        />
        <Select
          key={`${row.id}options_table`}
          name="options_table"
          value={row.options_table}
          field="options_table"
          label="Werte-Liste"
          options={optionsTableSelectValues}
          saveToDb={onBlur}
          error={errors?.field?.options_table}
          disabled={!userMayEdit}
        />
        <RadioButtonGroup
          key={`${row.id}field_type`}
          name="field_type"
          value={row.field_type}
          field="field_type"
          label="Feld-Typ"
          dataSource={fieldTypeValues}
          onBlur={onBlur}
          error={errors?.field?.field_type}
          disabled={!userMayEdit}
        />
        <RadioButtonGroup
          key={`${row.id}widget_type`}
          name="widget_type"
          value={row.widget_type}
          field="widget_type"
          label="Widget"
          dataSource={fieldTypeValues}
          onBlur={onBlur}
          error={errors?.field?.widget_type}
          disabled={!userMayEdit}
        />
        <TextField
          key={`${row?.id ?? ''}standard_value`}
          name="standard_value"
          label="Standard-Wert (wird in neue Datensätze eingesetzt)"
          value={row.standard_value}
          onBlur={onBlur}
          error={errors?.field?.standard_value}
          disabled={!userMayEdit}
          type="text"
        />
        <p>{'TODO: add row_label once fields exist '}</p>
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(TableForm)
