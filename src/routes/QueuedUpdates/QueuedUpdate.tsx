import React, { useContext, useCallback, useMemo } from 'react'
import styled from '@emotion/styled'
import dayjs from 'dayjs'
import { observer } from 'mobx-react-lite'
import { FaUndoAlt } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../storeContext'
import { dexie, Project, Table, QueuedUpdate } from '../../dexieClient'
import syntaxHighlightJson from '../../utils/syntaxHighlightJson'
import extractPureData from '../../utils/extractPureData'

// to hover and style row, see: https://stackoverflow.com/a/48109479/712005
const Value = styled.div``
const JsonValue = styled.pre`
  margin: 0;
  overflow-x: auto;
  &:hover,
  &:focus {
    width: min-content;
  }
  .string {
    color: green;
  }
  .number {
    color: darkorange;
  }
  .boolean {
    color: blue;
  }
  .null {
    color: magenta;
  }
  .key {
    color: red;
  }
`
const Icon = styled.div``
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`
const RevertButton = styled(IconButton)`
  z-index: 4;
`

const valFromValue = (value) => {
  if (value === true) return 'wahr'
  if (value === false) return 'falsch'
  return value ?? '(leer)'
}

interface Props {
  qu: QueuedUpdate
  pureData: boolean
}

const QueuedUpdateComponent = ({ qu, pureData }: Props) => {
  const store = useContext(StoreContext)
  const { rebuildTree, session } = store
  const { id, time, table: tableName, is: isRaw, was: wasRaw } = qu

  const is = useMemo(() => (isRaw ? JSON.parse(isRaw) : {}), [isRaw])
  const was = wasRaw ? JSON.parse(wasRaw) : null
  const isInsert =
    is?.revisions?.length === 1 || (tableName === 'projects' && !wasRaw)
  const isDeletion = was?.deleted === 0 && is?.deleted === 1
  const isUndeletion = was?.deleted === 1 && is?.deleted === 0
  const rowId = isInsert ? is?.id : qu.tableId

  // TODO: get project and table from is
  // console.log('QueuedUpdateComponent, is:', is)
  const data = useLiveQuery(async () => {
    let project: Project | undefined
    let table: Table | undefined
    if (is?.table_id) {
      // TODO: get table
      table = await dexie.ttables.get(is.table_id)
    }
    if (is?.project_id) {
      // TODO: get project
      project = await dexie.projects.get(is.project_id)
    }
    if (table?.project_id) {
      project = await dexie.projects.get(table.project_id)
    }
    if (!project && is?.account_id) {
      // this is itself a project
      project = await dexie.projects.get(is.id)
    }

    return { project, table }
  }, [is.table_id, is.project_id])

  let table = data?.table?.label ?? data?.table?.name
  if (tableName === 'projects') {
    table = 'Projekte'
  }
  const project = data?.project?.label ?? data?.project?.name

  const onClickRevert = useCallback(() => {
    // 1. create value
    // use is as base
    const val = {
      ...is,
      client_rev_at: new window.Date().toISOString(),
      client_rev_by: session.user?.email ?? session.user?.id,
    }
    if (isInsert || isUndeletion) {
      val.deleted = 1
    } else if (isDeletion) {
      val.deleted = 0
    } else if (tableName && was) {
      // set data to was.data
      val.data = { ...was.data }
    }
    // 2. update in dexie
    dexie.table(tableName).update(rowId, val)
    rebuildTree()
    // 3. update on server
    const update = new QueuedUpdate(
      undefined,
      undefined,
      tableName,
      rowId,
      JSON.stringify(val),
      undefined,
      JSON.stringify(is),
    )
    dexie.queued_updates.add(update)
    // 4. remove this queued update
    dexie.queued_updates.delete(id)
  }, [
    is,
    session.user?.email,
    session.user?.id,
    isInsert,
    isUndeletion,
    isDeletion,
    tableName,
    was,
    rowId,
    rebuildTree,
    id,
  ])

  const timeValue = dayjs(time).format('YYYY.MM.DD HH:mm:ss')
  const showWasValue = !isInsert && !!wasRaw
  // !isInsert &&
  // !isDeletion &&
  // wasRaw &&
  // ((showDataProperty && was.data) || false)
  const wasValue = syntaxHighlightJson(
    JSON.stringify(pureData ? extractPureData(was) ?? '' : was, undefined, 2),
  )
  const showIsValue = !isInsert && !isDeletion && isRaw
  const isValue = syntaxHighlightJson(
    JSON.stringify(pureData ? extractPureData(is) : is, undefined, 2),
  )

  return (
    <>
      <Value>{timeValue}</Value>
      <Value>{project}</Value>
      <Value>{tableName}</Value>
      <Value>{table}</Value>
      <Value>{rowId}</Value>
      <Value>
        {isInsert
          ? 'neuer Datensatz'
          : isDeletion
          ? 'Löschung'
          : isUndeletion
          ? 'Wiederherstellung'
          : 'Änderung'}
      </Value>
      <Value>
        {showWasValue ? (
          <JsonValue
            dangerouslySetInnerHTML={{
              __html: wasValue,
            }}
          ></JsonValue>
        ) : (
          ' '
        )}
      </Value>
      <Value>
        {showIsValue ? (
          <JsonValue
            dangerouslySetInnerHTML={{
              __html: isValue,
            }}
          ></JsonValue>
        ) : (
          ' '
        )}
      </Value>
      <Icon>
        <ButtonContainer>
          <RevertButton
            title="widerrufen"
            aria-label="widerrufen"
            onClick={onClickRevert}
            size="small"
          >
            <FaUndoAlt />
          </RevertButton>
        </ButtonContainer>
      </Icon>
    </>
  )
}

export default observer(QueuedUpdateComponent)
