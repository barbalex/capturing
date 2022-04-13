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
  Project,
  IProjectUser,
  Table,
} from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'
import TextField from '../../shared/TextField'
import Select from '../../shared/Select'
import RadioButtonGroupWithInfo from '../../shared/RadioButtonGroupWithInfo'
import sortProjectsByLabelName from '../../../utils/sortProjectsByLabelName'
import sortByLabelName from '../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'
import RelTypePopover from './RelTypePopover'

const FieldsContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`

const relTypeDataSource = [
  {
    value: '1',
    label: '1',
  },
  {
    value: 'n',
    label: 'n',
  },
]

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
    const [project, optionsTables, fields, optionsTable, projectUser] =
      await Promise.all([
        dexie.projects.where({ id: projectId }).first(),
        dexie.ttables.where({ deleted: 0, project_id: projectId }).toArray(),
        dexie.fields.where({ deleted: 0, table_id: tableId }).toArray(),
        dexie.ttables
          .where('type')
          .anyOf(['value_list', 'id_value_list'])
          .toArray(),
        dexie.project_users
          .where({
            project_id: projectId,
            user_email: session?.user?.email,
          })
          .first(),
      ])

    return { project, optionsTables, fields, optionsTable, projectUser }
  }, [projectId, row?.parent_id, session?.user?.email])
  const project = data?.project
  const optionsTables = sortByLabelName({
    objects: data?.tables ?? [],
    useLabels: row.use_labels,
  })
  const fields: Field[] = sortByLabelName({
    objects: data?.fields ?? [],
    useLabels: row.use_labels,
  })
  const optionsTable = data?.optionsTable
  const userRole = data?.projectUser?.role
  const userMayEdit = userRole === 'project_manager'

  const tableSelectValues = optionsTables.map((t) => ({
    value: t.id,
    label: labelFromLabeledTable({ object: t, useLabels: project.use_labels }),
  }))

  // console.log('ProjectForm rendering row:', row)

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
                error={errors?.table?.deleted}
                disabled={!userMayEdit}
              />
            ) : (
              <Checkbox2States
                key={`${row.id}deleted`}
                label="gelöscht"
                name="deleted"
                value={row.deleted}
                onBlur={onBlur}
                error={errors?.table?.deleted}
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
          error={errors?.table?.name}
          disabled={!userMayEdit}
        />
        <Checkbox2States
          key={`${row.id}use_labels`}
          label="Zusätzlich zu Namen Beschriftungen verwenden"
          name="use_labels"
          value={row.use_labels}
          onBlur={onBlur}
          error={errors?.table?.use_labels}
          disabled={!userMayEdit}
        />
        {row.use_labels === 1 && (
          <TextField
            key={`${row.id}label`}
            name="label"
            label="Beschriftung"
            value={row.label}
            onBlur={onBlur}
            error={errors?.table?.label}
            disabled={!userMayEdit}
          />
        )}
        <TextField
          key={`${row?.id ?? ''}sort`}
          name="sort"
          label="Sortierung"
          value={row.sort}
          onBlur={onBlur}
          error={errors?.table?.sort}
          disabled={!userMayEdit}
          type="number"
        />
        <Select
          key={`${row.id}${row?.options_table ?? ''}options_table`}
          name="options_table"
          value={row.options_table}
          field="options_table"
          label="Optionen-Tabelle"
          options={tableSelectValues}
          saveToDb={onBlur}
          error={errors?.table?.options_table}
          disabled={!userMayEdit}
        />
        <p>{'TODO: add row_label once fields exist '}</p>
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(TableForm)
