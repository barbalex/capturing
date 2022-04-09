import React from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'

import Conflict from './Conflict'

const Konflikte = styled.div`
  margin-bottom: 10px;
`
type ConflictListProps = {
  conflicts: string[]
  activeConflict: string
  setActiveConflict: (string) => void
}
const ConflictList = ({
  conflicts,
  activeConflict,
  setActiveConflict,
}: ConflictListProps) => (
  <Konflikte>
    {[...conflicts].sort().map((conflict) => (
      <Conflict
        key={conflict}
        conflict={conflict}
        activeConflict={activeConflict}
        setActiveConflict={setActiveConflict}
      />
    ))}
  </Konflikte>
)

export default observer(ConflictList)
