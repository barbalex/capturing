import React, { useRef, useEffect } from 'react'
import styled from '@emotion/styled'

const OuterDiv = styled.div`
  ${(props) => !props['data-visible'] && 'visibility: hidden;'}
`
const InnerDiv = styled.div`
  border: none !important;
  box-shadow: none !important;
  /* float children right */
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

// Classes used by Leaflet to position controls
const POSITION_CLASSES = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right',
}

const Control = ({ children, position, visible = true }) => {
  const positionClass =
    (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright

  // prevent click propagation on to map 
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  return (
    <OuterDiv
      className="leaflet-control-container first"
      data-visible={visible}
      ref={ref}
    >
      <div className={positionClass}>
        <InnerDiv className="leaflet-control leaflet-bar">{children}</InnerDiv>
      </div>
    </OuterDiv>
  )
}

export default Control
