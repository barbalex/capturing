/* eslint-disable react-hooks/exhaustive-deps */
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
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import StoreContext from '../../../storeContext'
import Checkbox2States from '../../shared/Checkbox2States'
import JesNo from '../../shared/JesNo'
import ErrorBoundary from '../../shared/ErrorBoundary'
import {
  dexie,
  Field,
  ITable,
  Table,
  TableTypeEnum,
  QueuedUpdate,
} from '../../../dexieClient'
import TextField from '../../shared/TextField'
import Spinner from '../../shared/Spinner'
import RadioButtonGroup from '../../shared/RadioButtonGroup'
import sortByLabelName from '../../../utils/sortByLabelName'
import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'
import RowLabel from './RowLabel'
import LayerStyle from '../../shared/LayerStyle'
import { IStore } from '../../../store'

const FieldsContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`
export const Comment = styled.p`
  color: rgba(0, 0, 0, 0.6);
  font-weight: 400;
  font-size: 0.8rem;
`

type TableFormProps = {
  showFilter: (boolean) => void
}
type valueType = {
  value: string
  label: string
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

  const store: IStore = useContext(StoreContext)
  const { filter, errors, rebuildTree, session } = store

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
  const data = useLiveQuery(async () => {
    const [project, tables, row, projectUser] = await Promise.all([
      dexie.projects.get(projectId),
      dexie.ttables
        .where({ deleted: 0, project_id: projectId, type: 'standard' })
        .toArray(),
      dexie.ttables.get(tableId),
      dexie.project_users.get({
        project_id: projectId,
        user_email: session?.user?.email,
      }),
    ])

    const userRole = projectUser?.role
    const userMayEdit = [
      'account_manager',
      'project_manager',
      'project_editor',
    ].includes(userRole)

    const useLabels = project.use_labels

    return {
      useLabels,
      tablesValues: sortByLabelName({
        objects: tables,
        useLabels,
      })
        // do not list own table
        .filter((t) => t.id !== tableId)
        .map((t) => ({
          value: t.id,
          label: labelFromLabeledTable({
            object: t,
            useLabels,
          }),
        })),
      row,
      userMayEdit,
    }
  }, [projectId, tableId, session?.user?.email])

  const useLabels: boolean = data?.useLabels
  const row: Table = data?.row
  const userMayEdit: boolean = data?.userMayEdit

  const tableTypeValues = Object.values(TableTypeEnum).map((v) => ({
    value: v,
    label: typeValueLabels[v],
  }))

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

  const [purgeFieldsDialogOpen, setPurgeFieldsDialogOpen] =
    useState<boolean>(false)
  const onClosePurgeFieldsDialog = useCallback(() => {
    onBlur({ target: { name: 'type', value: 'standard' } })
    setPurgeFieldsDialogOpen(false)
  }, [])
  const createValueListFields = useCallback(async () => {
    const newField = new Field(
      undefined,
      tableId,
      'value',
      undefined,
      undefined,
      undefined,
      'text',
      'text',
    )
    const update = new QueuedUpdate(
      undefined,
      undefined,
      'fields',
      JSON.stringify(newField),
      undefined,
      undefined,
    )
    await Promise.all([
      dexie.fields.put(newField),
      dexie.queued_updates.add(update),
    ])
    if (rowState.current.type === 'id_value_list') {
      const newField = new Field(
        undefined,
        tableId,
        'id',
        undefined,
        undefined,
        undefined,
        'text',
        'text',
      )
      const update = new QueuedUpdate(
        undefined,
        undefined,
        'fields',
        JSON.stringify(newField),
        undefined,
        undefined,
      )
      await Promise.all([
        dexie.fields.put(newField),
        dexie.queued_updates.add(update),
      ])
    }
    rebuildTree()
  }, [])
  const onPurgeFields = useCallback(async () => {
    // delete this table's fields
    const fields = await dexie.fields
      .where({ table_id: tableId, deleted: 0 })
      .toArray()
    await dexie.fields.bulkDelete(fields.map((f) => f.id))
    setPurgeFieldsDialogOpen(false)
    createValueListFields()
  }, [createValueListFields, tableId])

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
      // rebuild tree if needed
      if (['name', 'label'].includes(field)) rebuildTree()
      // create fields for dropdown tables
      if (field === 'type' && newValue !== 'standard') {
        // if fields already exist: ask user if they shall be replaced
        const fields = await dexie.fields
          .where({ table_id: tableId, deleted: 0 })
          .toArray()
        if (fields.length) return setPurgeFieldsDialogOpen(true)
        createValueListFields()
      }
    },
    [createValueListFields, filter, rebuildTree, row, showFilter, tableId],
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
          <>
            <TextField
              key={`${row.id}label`}
              name="label"
              label="Beschriftung"
              value={row.label}
              onBlur={onBlur}
              error={errors?.table?.label}
              disabled={!userMayEdit}
            />
            <TextField
              key={`${row.id}singular_label`}
              name="singular_label"
              label="Einzahl der Beschriftung (um einzelne Datensätze zu beschriften)"
              value={row.singular_label}
              onBlur={onBlur}
              error={errors?.table?.singular_label}
              disabled={!userMayEdit}
            />
          </>
        )}
        <RadioButtonGroup
          key={`${row?.id}type`}
          value={row.type}
          name="type"
          dataSource={tableTypeValues}
          onBlur={onBlur}
          label="Tabellen-Typ"
          error={errors?.table?.type}
        />
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
          <>
            <RowLabel
              useLabels={useLabels}
              updateOnServer={updateOnServer}
              rowState={rowState}
            />
            <LayerStyle
              key={`${row?.id ?? ''}layerstyle`}
              userMayEdit={userMayEdit}
              row={row}
            />
          </>
        ) : (
          <Comment>
            Werte-Listen werden automatisch mit den Werten selbst beschriftet.
          </Comment>
        )}
      </FieldsContainer>
      <Dialog
        open={purgeFieldsDialogOpen}
        onClose={onClosePurgeFieldsDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'Bestehende Felder löschen?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Die Tabelle enthält bereits Felder. Um sie in eine Werte-Liste
            umzuwandeln, müssen diese entfernt werden.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClosePurgeFieldsDialog}>Abbrechen</Button>
          <Button onClick={onPurgeFields} autoFocus>
            Ja, bestehende Felder entfernen
          </Button>
        </DialogActions>
      </Dialog>
    </ErrorBoundary>
  )
}

export default observer(TableForm)
