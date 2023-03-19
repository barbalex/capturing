import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'

import StoreContext from '../../storeContext'
import History from './History'
import Conflict from './Conflict'
import { IStore } from '../../store'
import { Row } from '../../dexieClient'

interface Props {
  row: Row
  activeConflict: string | null
  setActiveConflict: (activeConflict: string | null) => void
  showHistory: boolean
  setShowHistory: (showHistory: boolean) => void
}

const RowAside = ({
  row,
  activeConflict,
  setActiveConflict,
  showHistory,
  setShowHistory,
}: Props) => {
  // const params = useParams()
  // const url = params['*']
  // const showHistory = url?.endsWith('history')
  const store: IStore = useContext(StoreContext)
  const { online } = store

  // console.log('RowForm rendering', { row, showHistory })

  const restoreCallback = useCallback(() => {
    setShowHistory(null)
  }, [setShowHistory])

  return (
    <>
      {online && (
        <>
          {activeConflict ? (
            <Conflict
              rev={activeConflict}
              row={row}
              setActiveConflict={setActiveConflict}
            />
          ) : showHistory ? (
            <History row={row} restoreCallback={restoreCallback} />
          ) : null}
        </>
      )}
    </>
  )
}

export default observer(RowAside)
