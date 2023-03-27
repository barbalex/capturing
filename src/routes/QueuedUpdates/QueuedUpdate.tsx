import React, { useContext, useCallback } from 'react'
import styled from '@emotion/styled'
import dayjs from 'dayjs'
import { observer } from 'mobx-react-lite'
import { FaUndoAlt } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'

import StoreContext from '../../storeContext'
import { QueuedUpdate } from '../../dexieClient'

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

  const is = JSON.parse(isRaw)
  const isInsert = is.revisions.length === 1
  const was = wasRaw ? JSON.parse(wasRaw) : null

  const onClickRevert = useCallback(() => {
    if (table && was) {
      // TODO: should client_rev_at and client_rev_by be updated?
      store.updateModelValues({
        table: table,
        id: 'TODO:',
        values: JSON.parse(was),
      })
    }
    removeQueuedQueryById(id)
  }, [id, removeQueuedQueryById, store, table, was])

  const timeValue = dayjs(time).format('YYYY.MM.DD HH:mm:ss')

  return (
    <>
      <Value bt={index === 0}>{timeValue}</Value>
      <Value bt={index === 0}>{table}</Value>
      <Value bt={index === 0}>
        {isInsert ? 'neuer Datensatz' : 'Änderung'}
      </Value>
      <Value bt={index === 0}>{wasRaw}</Value>
      <Value bt={index === 0}>{isRaw}</Value>
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
