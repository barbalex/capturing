import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'

import StoreContext from '../../storeContext'
import History from './History'

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

  const conflictDisposalCallback = useCallback(
    () => setActiveConflict(null),
    [setActiveConflict],
  )
  const conflictSelectionCallback = useCallback(
    () => setActiveConflict(null),
    [setActiveConflict],
  )
  const restoreCallback = useCallback(() => {
    // TODO: need to get rich-text field to update
    setShowHistory(null)
  }, [setShowHistory])

  return (
    <>
      {online && (
        <>
          {activeConflict ? (
            <div
              rev={activeConflict}
              id={row.id}
              row={row}
              conflictDisposalCallback={conflictDisposalCallback}
              conflictSelectionCallback={conflictSelectionCallback}
              setActiveConflict={setActiveConflict}
            >
              TODO: conflict
            </div>
          ) : showHistory ? (
            <History row={row} restoreCallback={restoreCallback} />
          ) : null}
        </>
      )}
    </>
  )
}

export default observer(RowAside)
