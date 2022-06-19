import React, { useCallback, useContext, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import md5 from 'blueimp-md5'
import { v1 as uuidv1 } from 'uuid'
import isEqual from 'lodash/isEqual'

import History from '../../shared/History'
import storeContext from '../../../storeContext'
import checkForOnlineError from '../../../utils/checkForOnlineError'


const HistoryRow = ({ row, revRow, historyTakeoverCallback }) => {
  const store = useContext(StoreContext)
  const { user, addNotification,  } = store

  return <div>{JSON.stringify(revRow)}</div>
}

export default HistoryRow
