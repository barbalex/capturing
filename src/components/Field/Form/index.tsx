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
  IWidgetForField,
  Project,
  IProjectUser,
  Table,
} from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'
import TextField from '../../shared/TextField'
import Select from '../../shared/Select'
import Spinner from '../../shared/Spinner'
import RadioButtonGroup from '../../shared/RadioButtonGroup'
import sortByLabelName from '../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'

const FieldsContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`

type FieldFormProps = {
  showFilter: (boolean) => void
}
type DataProps = {
  useLabels: boolean
  projects: Project[]
  fields: Field[]
  optionsTable: Table
  projectUser: IProjectUser
}

// = '99999999-9999-9999-9999-999999999999'
const FieldForm = ({ showFilter }: FieldFormProps) => {
  const { projectId, tableId, fieldId } = useParams()
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
    unsetError('table')
  }, [fieldId, unsetError])

  // const data = {}
  const data: DataProps = useLiveQuery(async () => {
    const [project, optionsTables, row, fields, fieldTypes, projectUser] =
      await Promise.all([
        dexie.projects.get(projectId),
        dexie.ttables
          .filter(
            (t) =>
              t.deleted === 0 &&
              t.project_id === projectId &&
              ['value_list', 'id_value_list'].includes(t.type),
          )
          .toArray(),
        dexie.fields.get(fieldId),
        dexie.fields.where({ deleted: 0, table_id: tableId }).toArray(),
        dexie.field_types.where({ deleted: 0 }).sortBy('sort'),
        dexie.project_users.get({
          project_id: projectId,
          user_email: session?.user?.email,
        }),
      ])

    const useLabels = project.use_labels

    return {
      useLabels,
      optionsTables,
      row,
      fields,
      fieldTypes,
      projectUser,
    }
  }, [projectId, fieldId, session?.user?.email])
  const useLabels = data?.useLabels
  const row = data?.row
  const optionsTables = sortByLabelName({
    objects: data?.optionsTables ?? [],
    useLabels,
  })
  const fieldTypes: IFieldType = data?.fieldTypes ?? []
  //const widgetTypes: IWidgetType = data?.widgetTypes ?? []
  // const widgetsForFields: IWidgetForField = data?.widgetsForFields ?? []
  const userRole = data?.projectUser?.role
  const userMayEdit = userRole === 'project_manager'

  const widgetsForFields: IWidgetForField[] =
    useLiveQuery(
      async () =>
        await dexie.widgets_for_fields
          .where({ deleted: 0, field_value: row?.field_type ?? '' })
          .sortBy('sort'),
      [row?.field_type],
    ) ?? []
  const widgetValues = widgetsForFields.map((w) => w.widget_value)

  const widgetTypes: IWidgetType =
    useLiveQuery(
      async () =>
        dexie.widget_types
          .filter((wt) => wt.deleted === 0 && widgetValues.includes(wt.value))
          .sortBy('sort'),
      [row?.field_type, widgetsForFields],
    ) ?? []

  const optionsTableSelectValues = optionsTables.map((t) => ({
    value: t.id,
    label: labelFromLabeledTable({ object: t, useLabels }),
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
  const rowState = useRef<IField>()
  useEffect(() => {
    rowState.current = row
    // update originalRow only initially, once row has arrived
    if (!originalRow.current && row) {
      console.log('TableRow, setting originalRow to:', row)
      originalRow.current = row
    }
  }, [row])

  console.log('FieldForm, row:', row)

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
        {useLabels === 1 && (
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
          dataSource={widgetTypeValues}
          noDataMessage="(verfügbar, wenn ein Feld-Typ gewählt wurde)"
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
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(FieldForm)
