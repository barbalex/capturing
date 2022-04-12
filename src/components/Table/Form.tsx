import React, { useContext, useEffect, useCallback, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import isEqual from 'lodash/isEqual'
import { Session } from '@supabase/supabase-js'

import StoreContext from '../../storeContext'
import Checkbox2States from '../shared/Checkbox2States'
import JesNo from '../shared/JesNo'
import ErrorBoundary from '../shared/ErrorBoundary'
import { dexie, ITable, Table } from '../../dexieClient'
import { supabase } from '../../supabaseClient'
import TextField from '../shared/TextField'

const FieldsContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`

type TableFormProps = {
  id: string
  row: Table
  showFilter: (boolean) => void
}

const TableForm = ({ id, row, showFilter }: TableFormProps) => {
  const store = useContext(StoreContext)
  const { filter, errors } = store
  const session: Session = supabase.auth.session()
  const unsetError = useCallback(
    () => () => {
      console.log('TODO: unsetError')
    },
    [],
  ) // TODO: add errors, unsetError in store

  // console.log('ProjectForm rendering row:', row)

  const originalRow = useRef<ITable>()
  // update originalRow only initially
  useEffect(() => {
    originalRow.current = row
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rowState = useRef<ITable>()
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
          table: 'table',
          key: field,
          value: newValue,
        })
      }

      const newRow = { ...row, [field]: newValue }
      rowState.current = newRow
      dexie.ttables.put(newRow)
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
                key={`${row.id}deleted`}
                label="gelöscht"
                name="deleted"
                value={row.deleted}
                onBlur={onBlur}
                error={errors?.table?.deleted}
              />
            ) : (
              <Checkbox2States
                key={`${row.id}deleted`}
                label="gelöscht"
                name="deleted"
                value={row.deleted}
                onBlur={onBlur}
                error={errors?.table?.deleted}
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
        />

        <Checkbox2States
          key={`${row.id}use_labels`}
          label="Zusätzlich zu Namen Beschriftungen verwenden"
          name="use_labels"
          value={row.use_labels}
          onBlur={onBlur}
          error={errors?.table?.use_labels}
        />
        {row.use_labels === 1 && (
          <TextField
            key={`${row.id}label`}
            name="label"
            label="Beschriftung"
            value={row.label}
            onBlur={onBlur}
            error={errors?.table?.label}
          />
        )}
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(TableForm)