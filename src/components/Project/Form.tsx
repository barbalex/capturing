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
import { dexie, IProject } from '../../dexieClient'
import { supabase } from '../../supabaseClient'
import TextField from '../shared/TextField'
import ProjectUsers from './ProjectUsers'

const FormContainer = styled.div`
  height: 100%;
  overflow-y: auto;
`
const FieldsContainer = styled.div`
  padding: 10px;
`

type ProjectFormProps = {
  showFilter: (boolean) => void
}

const ProjectForm = ({ showFilter }: ProjectFormProps) => {
  const session: Session = supabase.auth.session()
  const { projectId } = useParams()
  const store = useContext(StoreContext)
  const { filter, errors } = store

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

  const row: Row = useLiveQuery(
    async () => await dexie.projects.get(projectId),
    [projectId],
  )

  // console.log('ProjectForm rendering row:', row)

  const originalRow = useRef<IProject>()
  const rowState = useRef<IProject>()
  useEffect(() => {
    rowState.current = row
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
      <FormContainer>
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
                  label="gelöscht"
                  name="deleted"
                  value={row.deleted}
                  onBlur={onBlur}
                  error={errors?.project?.deleted}
                />
              ) : (
                <Checkbox2States
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
            name="name"
            label="Name"
            value={row.name}
            onBlur={onBlur}
            error={errors?.project?.name}
          />
          <Checkbox2States
            label="Zusätzlich zu Namen Beschriftungen verwenden"
            name="use_labels"
            value={row.use_labels}
            onBlur={onBlur}
            error={errors?.project?.use_labels}
          />
          {row.use_labels === 1 && (
            <TextField
              name="label"
              label="Beschriftung"
              value={row.label}
              onBlur={onBlur}
              error={errors?.project?.label}
            />
          )}
          <TextField
            name="crs"
            label="CRS (Koordinaten-Referenz-System)"
            value={row.crs}
            type="number"
            onBlur={onBlur}
            error={errors?.project?.crs}
          />
          <TextField
            name="account_id"
            label="Konto"
            value={row.account_id}
            onBlur={onBlur}
            error={errors?.project?.account_id}
          />
        </FieldsContainer>
        <ProjectUsers />
      </FormContainer>
    </ErrorBoundary>
  )
}

export default observer(ProjectForm)
