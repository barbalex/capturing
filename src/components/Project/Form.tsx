import React, { useContext, useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import SimpleBar from 'simplebar-react'

import StoreContext from '../../storeContext'
import Checkbox2States from '../shared/Checkbox2States'
import JesNo from '../shared/JesNo'
import ifIsNumericAsNumber from '../../utils/ifIsNumericAsNumber'
import ErrorBoundary from '../shared/ErrorBoundary'
import ConflictList from '../shared/ConflictList'
import { IProject } from '../../dexieClient'

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
  row: IProject
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
  const unsetError = () => {} // TODO: add errors, unsetError in store

  useEffect(() => {
    unsetError('project')
  }, [id, unsetError])

  const saveToDb = useCallback(
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
      row.edit({ field, value, store })
    },
    [filter, row, showFilter, store],
  )

  const showDeleted = filter?.project?.deleted !== false || row?.deleted

  return (
    <ErrorBoundary>
      <SimpleBar style={{ maxHeight: '100%', height: '100%' }}>
        <FieldsContainer>
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
                  saveToDb={saveToDb}
                  error={errors?.project?.deleted}
                />
              ) : (
                <Checkbox2States
                  key={`${row.id}deleted`}
                  label="gelöscht"
                  name="deleted"
                  value={row.deleted}
                  saveToDb={saveToDb}
                  error={errors?.project?.deleted}
                />
              )}
            </>
          )}
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
