import React from 'react'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'

import Conflict from './Conflict'

const Konflikte = styled.div`
  margin-bottom: 10px;
`
type Props = {
  conflicts: string[]
  activeConflict: string
  setActiveConflict: () => void
}

const ConflictList = ({
  conflicts,
  activeConflict,
  setActiveConflict,
}: Props): React.FC => (
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
