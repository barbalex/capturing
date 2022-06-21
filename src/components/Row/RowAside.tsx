import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'

import StoreContext from '../../storeContext'
import History from './History'
import Conflict from './Conflict'

const RowAside = ({
  row,
  activeConflict,
  setActiveConflict,
  showHistory,
  setShowHistory,
}) => {
  // const params = useParams()
  // const url = params['*']
  // const showHistory = url?.endsWith('history')
  const store = useContext(StoreContext)
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
