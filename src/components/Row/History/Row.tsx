import React, { useCallback, useEffect, useState, useContext } from 'react'
import { observer } from 'mobx-react-lite'

import History from '../../shared/History'
import createDataArrayForRevComparison from '../createDataArrayForRevComparison'
import { Row } from '../../../dexieClient'
import storeContext from '../../../storeContext'

type Props = {
  row: Row
  revRow: any
  restoreCallback: any
}

const HistoryRow = ({ row, revRow, restoreCallback }: Props) => {
  const { session } = useContext(storeContext)

  const [dataArray, setDataArray] = useState([])
  useEffect(() => {
    createDataArrayForRevComparison({ row, revRow }).then((value) =>
      setDataArray(value),
    )
  }, [revRow, row])

  const onClickRestore = useCallback(() => {
    // need to attach to the winner, that is row
    // otherwise risk to still have lower depth and thus loosing
    const was = row
    const revData = {
      table_id: revRow.table_id,
      parent_id: revRow.parent_id,
      geometry: revRow.geometry,
      data: revRow.data,
      deleted: revRow.deleted,
    }
    const is = { ...row, ...revData }
    row.updateOnServer({ was, is, session })
    restoreCallback()
  }, [
    restoreCallback,
    revRow.data,
    revRow.deleted,
    revRow.geometry,
    revRow.parent_id,
    revRow.table_id,
    row,
    session,
  ])

  return (
    <History
      rev={revRow.rev}
      dataArray={dataArray}
      onClickRestore={onClickRestore}
    />
  )
}

export default observer(HistoryRow)
