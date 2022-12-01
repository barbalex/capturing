import styled from '@emotion/styled'

import labelFromLabeledTable from '../../../utils/labelFromLabeledTable'
import { Table } from '../../../dexieClient'

const Container = styled.div`
  padding: 0 8px;
  font-size: small;
`

type Props = {
  ownTable: Table
  parentTable: Table
  useLabels: boolean
}

const RelTypePopover = ({ ownTable, parentTable, useLabels }: Props) => {
  const parentTableLabel = labelFromLabeledTable({
    object: parentTable,
    useLabels,
  })
  const ownTableLabel = labelFromLabeledTable({
    object: ownTable,
    useLabels,
  })

  return (
    <Container>
      <p>
        {`1 heisst: Pro Datensatz in "${parentTableLabel}" soll höchstens einer in "${ownTableLabel}" existieren können`}
      </p>
      <p>
        {`n heisst: Pro Datensatz in "${parentTableLabel}" sollen mehrere (n) in "${ownTableLabel}" existieren können`}
      </p>
    </Container>
  )
}

export default RelTypePopover
