import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { useParams, Outlet } from 'react-router-dom'

import StoreContext from '../../storeContext'

const RowAside = ({ row, activeConflict, setActiveConflict }) => {
  const params = useParams()
  const url = params['*']
  const showHistory = url?.endsWith('history')
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
            // <History row={row} />
            <Outlet />
          ) : null}
        </>
      )}
    </>
  )
}

export default observer(RowAside)
