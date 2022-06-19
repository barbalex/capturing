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
const HistoryRow = ({ row, revRow, historyTakeoverCallback }) => {
  const store = useContext(storeContext)
  const { user, addNotification } = store

  const dataArray = useMemo(
    () => createDataArrayForRevComparison({ row, revRow }),
    [revRow, row],
  )
  console.log('HistoryRow, dataArray:', dataArray)

  const onClickWiderspruchUebernehmen = useCallback(() => {
    console.log('TODO:')
  }, [])

  return (
    <History
      rev={revRow.rev}
      dataArray={dataArray}
      onClickWiderspruchUebernehmen={onClickWiderspruchUebernehmen}
    />
  )
}

export default HistoryRow
