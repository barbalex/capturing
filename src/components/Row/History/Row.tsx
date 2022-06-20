import React, { useCallback, useContext, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import md5 from 'blueimp-md5'
import { v1 as uuidv1 } from 'uuid'
import isEqual from 'lodash/isEqual'

import History from '../../shared/History'
import storeContext from '../../../storeContext'
import checkForOnlineError from '../../../utils/checkForOnlineError'
import createDataArrayForRevComparison from '../../../utils/createDataArrayForRevComparison'

// TODO: what to do with rtf fields?
const HistoryRow = ({ row, revRow, restoreCallback }) => {
  const store = useContext(storeContext)
  const { user, addNotification } = store

  const dataArray = useMemo(
    () => createDataArrayForRevComparison({ row, revRow }),
    [revRow, row],
  )

  const onClickRestore = useCallback(() => {
    console.log('TODO:')
    // need to attach to the winner, that is row
    // otherwise risk to still have lower depth and thus loosing
  }, [])

  return (
    <History
      rev={revRow.rev}
      dataArray={dataArray}
      onClickRestore={onClickRestore}
    />
  )
}

export default HistoryRow
