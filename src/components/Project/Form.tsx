import React, { useContext, useEffect, useCallback, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import isEqual from 'lodash/isEqual'
import { Session } from '@supabase/supabase-js'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../storeContext'
import Checkbox2States from '../shared/Checkbox2States'
import JesNo from '../shared/JesNo'
import ErrorBoundary from '../shared/ErrorBoundary'
import Spinner from '../shared/Spinner'
import { dexie, IProject, Project } from '../../dexieClient'
import { supabase } from '../../supabaseClient'
import TextField from '../shared/TextField'

const FieldsContainer = styled.div`
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`

type ProjectFormProps = {
  showFilter: (boolean) => void
}

const ProjectForm = ({ showFilter }: ProjectFormProps) => {
  const { projectId } = useParams()
  const store = useContext(StoreContext)
  const { filter, errors } = store
  const session: Session = supabase.auth.session()

  // console.log('ProjectForm rendering')

  const unsetError = useCallback(
    () => () => {
      console.log('TODO: unsetError')
    },
    [],
  ) // TODO: add errors, unsetError in store
  useEffect(() => {
    unsetError('project')
  }, [projectId, unsetError])

  const row: Project = useLiveQuery(
    async () => await dexie.projects.get(projectId),
    [projectId],
  )

  // console.log('ProjectForm rendering row:', row)

  const originalRow = useRef<IProject>()
  const rowState = useRef<IProject>()
  useEffect(() => {
    rowState.current = row
    if (!originalRow.current && row) {
      console.log('TableRow, setting originalRow to:', row)
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
          table: 'project',
          key: field,
          value: newValue,
        })
      }

      // update rowState
      rowState.current = { ...row, ...{ [field]: newValue } }
      // update dexie
      dexie.projects.update(row.id, { [field]: newValue })
    },
    [filter, row, showFilter],
  )

  // const showDeleted = filter?.project?.deleted !== false || row?.deleted
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
        <p>{'TODO: add project_users'}</p>
      </FieldsContainer>
    </ErrorBoundary>
  )
}

export default observer(ProjectForm)
