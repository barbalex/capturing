import React, { useContext, useEffect, useCallback, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import SimpleBar from 'simplebar-react'
import isEqual from 'lodash/isEqual'
import { Session } from '@supabase/supabase-js'

import StoreContext from '../../storeContext'
import Checkbox2States from '../shared/Checkbox2States'
import JesNo from '../shared/JesNo'
import ifIsNumericAsNumber from '../../utils/ifIsNumericAsNumber'
import ErrorBoundary from '../shared/ErrorBoundary'
import ConflictList from '../shared/ConflictList'
import { db as dexie, IProject, Project, QueuedUpdate } from '../../dexieClient'
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

  // console.log('ProjectForm rendering', { row })

  const originalRow = useRef<IProject>()
  // update originalRow only initially
  useEffect(() => {
    originalRow.current = row
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    unsetError('project')
  }, [id, unsetError])

  const queueUpdate = useCallback(async () => {
    // only update if is changed
    if (!isEqual(originalRow.current, row)) {
      const newObject = {
        ...row,
        client_rev_at: new window.Date().toISOString(),
        client_rev_by: session.user?.email ?? session.user?.id,
      }
      console.log('ProjectForm, queueUpdate, newObject:', newObject)
      //row.update({row})
      const update = new QueuedUpdate(
        undefined,
        undefined,
        'projects',
        JSON.stringify(newObject),
        newObject?.id,
        JSON.stringify(row),
      )
      await dexie.queued_updates.add(update)
    }
    return
  }, [row, session.user?.email, session.user?.id])

  useEffect(() => {
    window.onbeforeunload = async () => {
      // save any data changed before closing tab or browser
      await queueUpdate()
      return
    }
  }, [queueUpdate])

  const onBlur = useCallback(
    async (event) => {
      const field: string = event.target.name
      let value = ifIsNumericAsNumber(event.target.value)
      if (event.target.value === undefined) value = null
      if (event.target.value === '') value = null

      if (showFilter) {
        return filter.setValue({ table: 'project', key: field, value })
      }

      // only update if value has changed
      const previousValue = ifIsNumericAsNumber(row[field])
      if (value === previousValue) return
      const newRow = { ...row, [field]: value }
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
              queueUpdate()
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
