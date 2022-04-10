import React, { useContext, useEffect, useCallback, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import SimpleBar from 'simplebar-react'
import isEqual from 'lodash/isEqual'
import { Session } from '@supabase/supabase-js'

import StoreContext from '../../storeContext'
import Checkbox2States from '../shared/Checkbox2States'
import JesNo from '../shared/JesNo'
import ErrorBoundary from '../shared/ErrorBoundary'
import ConflictList from '../shared/ConflictList'
import { dexie, IProject, Project } from '../../dexieClient'
import { supabase } from '../../supabaseClient'
import TextField from '../shared/TextField'

const FieldsContainer = styled.div`
  padding: 10px;
  height: 100%;
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

type ProjectFormProps = {
  activeConflict: string
  id: string
  row: Project
  setActiveConflict: (string) => void
  showFilter: (boolean) => void
  showHistory: (boolean) => void
}

const ProjectForm = ({
  activeConflict,
  id,
  row,
  setActiveConflict,
  showFilter,
  showHistory,
}: ProjectFormProps) => {
  const store = useContext(StoreContext)
  const { filter, online, errors } = store
  const session: Session = supabase.auth.session()
  const unsetError = useCallback(
    () => () => {
      console.log('TODO: unsetError')
    },
    [],
  ) // TODO: add errors, unsetError in store

  // console.log('ProjectForm rendering row:', row)

  const originalRow = useRef<IProject>()
  // update originalRow only initially
  useEffect(() => {
    originalRow.current = row
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rowState = useRef<IProject>()
  // update originalRow only initially
  useEffect(() => {
    rowState.current = row
  }, [row])

  useEffect(() => {
    unsetError('project')
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
          table: 'project',
          key: field,
          value: newValue,
        })
      }

      const newRow = { ...row, [field]: newValue }
      rowState.current = newRow
      dexie.projects.put(newRow)
    },
    [filter, row, showFilter],
  )

  const showDeleted = filter?.project?.deleted !== false || row?.deleted

  return (
    <ErrorBoundary>
      <SimpleBar style={{ maxHeight: '100%', height: '100%' }}>
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
                  error={errors?.project?.deleted}
                />
              ) : (
                <Checkbox2States
                  key={`${row.id}deleted`}
                  label="gelöscht"
                  name="deleted"
                  value={row.deleted}
                  onBlur={onBlur}
                  error={errors?.project?.deleted}
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
            error={errors?.project?.name}
          />

          <Checkbox2States
            key={`${row.id}use_labels`}
            label="Zusätzlich zu Namen Beschriftungen verwenden"
            name="use_labels"
            value={row.use_labels}
            onBlur={onBlur}
            error={errors?.project?.use_labels}
          />
          {row.use_labels === 1 && (
            <TextField
              key={`${row.id}label`}
              name="label"
              label="Beschriftung"
              value={row.label}
              onBlur={onBlur}
              error={errors?.project?.label}
            />
          )}
          <TextField
            key={`${row.id}crs`}
            name="crs"
            label="CRS (Koordinaten-Referenz-System)"
            value={row.crs}
            type="number"
            onBlur={onBlur}
            error={errors?.project?.crs}
          />
          <TextField
            key={`${row.id}account_id`}
            name="account_id"
            label="Konto"
            value={row.account_id}
            onBlur={onBlur}
            error={errors?.project?.account_id}
          />
          {online && !showFilter && row?._conflicts?.map && (
            <ConflictList
              conflicts={row._conflicts}
              activeConflict={activeConflict}
              setActiveConflict={setActiveConflict}
            />
          )}
        </FieldsContainer>
      </SimpleBar>
    </ErrorBoundary>
  )
}

export default observer(ProjectForm)
