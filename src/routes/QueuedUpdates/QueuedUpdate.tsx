import React, { useContext, useCallback } from 'react'
import styled from '@emotion/styled'
import dayjs from 'dayjs'
import { observer } from 'mobx-react-lite'
import { FaUndoAlt } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'

import StoreContext from '../../storeContext'
import { QueuedUpdate } from '../../dexieClient'
import syntaxHighlightJson from '../../utils/syntaxHighlightJson'

// to hover and style row, see: https://stackoverflow.com/a/48109479/712005
const Value = styled.div`
  padding: 5px 0;
  &:before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    right: -1000%;
    left: -1000%;
    z-index: 1;
    ${(props) => props.bt && 'border-top: 1px solid rgba(74,20,140,0.1);'}
    border-bottom: 1px solid rgba(74,20,140,0.1);
  }
  &:after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    right: -1px;
    width: 1px;
    z-index: 2;
  }
  &:nth-of-type(5n + 5)::after {
    bottom: -1px;
    right: 0;
    left: -1000%;
    height: 1px;
    z-index: 3;
    width: auto;
    top: auto;
  }
  &:hover::before {
    background-color: rgba(0, 0, 0, 0.05);
  }
`
const JsonValue = styled.pre`
  margin: 0;
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
const Icon = styled.div`
  justify-self: center;
  padding: 5px 0;
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
  index: number
}

const QueuedUpdateComponent = ({ qu, index }: Props) => {
  const store = useContext(StoreContext)
  const { removeQueuedQueryById } = store
  const { id, time, table, is: isRaw, was: wasRaw } = qu

  const is = isRaw ? JSON.parse(isRaw) : {}
  const was = wasRaw ? JSON.parse(wasRaw) : null
  const isInsert = is?.revisions?.length === 1
  const isDeletion = was?.deleted === 0 && is?.deleted === 1
  const isUndeletion = was?.deleted === 1 && is?.deleted === 0
  const showDataProperty = !!is?.data

  const onClickRevert = useCallback(() => {
    if (table && was) {
      // TODO: should client_rev_at and client_rev_by be updated?
      // store.updateModelValues({
      //   table: table,
      //   id: 'TODO:',
      //   values: JSON.parse(was),
      // })
    }
    removeQueuedQueryById(id)
  }, [removeQueuedQueryById, table, was, id])

  const timeValue = dayjs(time).format('YYYY.MM.DD HH:mm:ss')
  const showWasValue =
    !isInsert &&
    !isDeletion &&
    wasRaw &&
    ((showDataProperty && was.data) || false)
  const wasValue = syntaxHighlightJson(
    JSON.stringify(showDataProperty ? was?.data ?? '' : was, undefined, 2),
  )
  const showIsValue = !isInsert && !isDeletion && isRaw
  const isValue = syntaxHighlightJson(
    JSON.stringify(showDataProperty ? is?.data : is, undefined, 2),
  )
  const rowId = isInsert ? is?.id : is?.tableId

  return (
    <>
      <Value bt={index === 0}>{timeValue}</Value>
      <Value bt={index === 0}>{table}</Value>
      <Value bt={index === 0}>{rowId}</Value>
      <Value bt={index === 0}>
        {isInsert
          ? 'neuer Datensatz'
          : isDeletion
          ? 'Löschung'
          : isUndeletion
          ? 'Wiederherstellung'
          : 'Änderung'}
      </Value>
      <Value bt={index === 0}>
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
      <Value bt={index === 0}>
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
      <Icon bt={index === 0}>
        <RevertButton
          title="widerrufen"
          aria-label="widerrufen"
          onClick={onClickRevert}
          size="small"
        >
          <FaUndoAlt />
        </RevertButton>
      </Icon>
    </>
  )
}

export default observer(QueuedUpdateComponent)
