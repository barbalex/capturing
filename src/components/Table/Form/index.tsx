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
  ITable,
  Table,
  Project,
  IProjectUser,
  TableTypeEnum,
  TableRelTypeEnum,
} from '../../../dexieClient'
import { supabase } from '../../../supabaseClient'
import TextField from '../../shared/TextField'
import Select from '../../shared/Select'
import Spinner from '../../shared/Spinner'
import RadioButtonGroupWithInfo from '../../shared/RadioButtonGroupWithInfo'
import RadioButtonGroup from '../../shared/RadioButtonGroup'
import sortProjectsByLabelName from '../../../utils/sortProjectsByLabelName'
import sortByLabelName from '../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'
import RelTypePopover from './RelTypePopover'
import RowLabel from './RowLabel'

const FieldsContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`

const relTypeDataSource = Object.values(TableRelTypeEnum).map((v) => ({
  value: v?.toString(),
  label: v?.toString(),
}))

type TableFormProps = {
  showFilter: (boolean) => void
}
type DataProps = {
  project: Project
  projects: Project[]
  tables: Table[]
  relTable: Table
  projectUser: IProjectUser
}

const typeValueLabels = {
  id_value_list:
    'Werte-Liste, enthält für jeden Wert eine ID und speichert jeweils die ID',
  standard: 'normale Tabelle, Sie definieren die Felder',
  value_list: 'Werte-Liste, enthält nur die Werte',
}

// = '99999999-9999-9999-9999-999999999999'
const TableForm = ({ showFilter }: TableFormProps) => {
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
  useEffect(() => {
    unsetError('table')
  }, [tableId, unsetError])

  // const data = {}
  const data: DataProps = useLiveQuery(async () => {
    const [project, projects, tables, row, projectUser] = await Promise.all([
      dexie.projects.get(projectId),
      dexie.projects.where({ deleted: 0 }).toArray(),
      dexie.ttables.where({ deleted: 0, project_id: projectId }).toArray(),
      dexie.ttables.get(tableId),
      dexie.project_users.get({
        project_id: projectId,
        user_email: session?.user?.email,
      }),
    ])

    const userRole = projectUser?.role
    const userMayEdit = ['project_manager', 'project_editor'].includes(userRole)

    const useLabels = project.use_labels

    return { useLabels, projects, tables, row, userMayEdit }
  }, [projectId, tableId, session?.user?.email])

  const useLabels: boolean = data?.useLabels
  const projects = sortProjectsByLabelName(data?.projects ?? [])
  const row: Table = data?.row
  const tables: Table[] = sortByLabelName({
    objects: data?.tables ?? [],
    useLabels,
  })
  const userMayEdit = data?.userMayEdit

  const relTable: Table = useLiveQuery(
    async () =>
      await dexie.ttables.get({
        id: row?.parent_id ?? '99999999-9999-9999-9999-999999999999',
      }),
    [row?.parent_id],
  )

  const projectSelectValues = projects.map((p) => ({
    value: p.id,
    label: labelFromLabeledTable({ object: p, useLabels: p.use_labels }),
  }))
  const tableTypeValues = Object.values(TableTypeEnum).map((v) => ({
    value: v,
    label: typeValueLabels[v],
  }))

  const tablesSelectValues = tables
    // do not list own table
    .filter((t) => t.id !== tableId)
    .map((t) => ({
      value: t.id,
      label: labelFromLabeledTable({
        object: t,
        useLabels,
      }),
    }))

  // console.log('ProjectForm rendering row:', row)

  // need original row to be able to roll back optimistic ui updates
  const originalRow = useRef<ITable>()
  // need to update rowState on blur because of
  // when user directly closes app after last update in field
  // seems that waiting for dexie update goes too long
  const rowState = useRef<ITable>()
  useEffect(() => {
    rowState.current = row
    // update originalRow only initially, once row has arrived
    if (!originalRow.current && row) {
      console.log('TableRow, setting originalRow to:', row)
      originalRow.current = row
    }
  }, [row])
  console.log('TableRow, rowState:', rowState.current)

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
      // do not return - otherwise user is dialoged, and that does not help the saving
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
          table: 'table',
          key: field,
          value: newValue,
        })
      }

      // update rowState
      rowState.current = { ...row, ...{ [field]: newValue } }
      // update dexie
      dexie.ttables.update(row.id, { [field]: newValue })
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
        {useLabels === 1 && (
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
        <Select
          key={`${row.id}${row?.project_id ?? ''}project_id`}
          name="project_id"
          value={row.project_id}
          field="project_id"
          label="Gehört zum Projekt"
          options={projectSelectValues}
          saveToDb={onBlur}
          error={errors?.table?.project_id}
          disabled={!userMayEdit}
        />
        <RadioButtonGroup
          value={row.type}
          name="type"
          dataSource={tableTypeValues}
          onBlur={onBlur}
          label="Tabellen-Typ"
          error={errors?.table?.type}
        />
        <Select
          key={`${row.id}${row?.parent_id ?? ''}parent_id`}
          name="parent_id"
          value={row.parent_id}
          field="parent_id"
          label="Verknüpfte Tabelle (Mutter: 1:n, Geschwister: 1:1)"
          options={tablesSelectValues}
          saveToDb={onBlur}
          error={errors?.table?.parent_id}
          disabled={!userMayEdit}
        />
        {!!row.parent_id && (
          <RadioButtonGroupWithInfo
            value={row.rel_type}
            name="rel_type"
            dataSource={relTypeDataSource}
            onBlur={onBlur}
            label="Beziehung zur verknüpften Tabelle"
            error={errors?.table?.rel_type}
            popover={
              <RelTypePopover
                ownTable={row}
                parentTable={relTable}
                useLabels={useLabels}
              />
            }
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
        {row.type === 'standard' ? (
          <RowLabel
            useLabels={useLabels}
            updateOnServer={updateOnServer}
            rowState={rowState}
          />
        ) : (
          <p>
            Werte-Listen werden automatisch mit den Werten selbst beschriftet
          </p>
        )}
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(TableForm)
