import React, { useCallback } from 'react'
import styled from '@emotion/styled'

const Konflikt = styled.div`
  color: #d84315;
  font-weight: ${(props) => (props['data-active'] ? 500 : 400)};
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`

type Props = {
  conflict: string
  activeConflict: string
  setActiveConflict: () => void
}

const Conflict = ({
  conflict,
  activeConflict,
  setActiveConflict,
}: Props): React.FC => {
  const onClick = useCallback(() => {
    setActiveConflict(
      !activeConflict
        ? conflict
        : activeConflict !== conflict
        ? conflict
        : null,
    )
  }, [activeConflict, conflict, setActiveConflict])
  const title = activeConflict
    ? 'Klicken um den Konflikt zu schliessen'
    : 'Klicken um den Konflikt zu lösen'

  return (
    <Konflikt
      key={conflict}
      data-active={activeConflict === conflict}
      onClick={onClick}
      title={title}
    >{`Konflikt mit Version ${conflict}`}</Konflikt>
  )
}

export default Conflict
