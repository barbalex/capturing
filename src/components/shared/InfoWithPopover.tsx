import React, { useState, useCallback, PropsWithChildren } from 'react'
import Popover from '@mui/material/Popover'

import { MdInfoOutline as InfoOutlineIcon } from 'react-icons/md'
import styled from '@emotion/styled'

const StyledInfoOutlineIcon = styled(InfoOutlineIcon)`
  cursor: pointer;
  pointer-events: auto;
  padding-left: 5px;
`
const StyledPopover = styled(Popover)`
  border-radius: 4px;
`

const InfoWithPopover = ({ children }): PropsWithChildren => {
  const [popupOpen, changePopupOpen] = useState<boolean>(false)
  const [popupAnchorEl, changePopupAnchorEl] = useState<HTMLAnchorElement>(null)

  const onClickFontIcon = useCallback(
    (event) => {
      event.preventDefault()
      changePopupOpen(!popupOpen)
      changePopupAnchorEl(event.currentTarget)
    },
    [popupOpen],
  )
  const onRequestClosePopover = useCallback(() => changePopupOpen(false), [])

  return (
    <>
      <StyledInfoOutlineIcon onClick={onClickFontIcon} />
      <StyledPopover
        open={popupOpen}
        anchorEl={popupAnchorEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        onClose={onRequestClosePopover}
      >
        {children}
      </StyledPopover>
    </>
  )
}

InfoWithPopover.defaultProps = {
  popupAnchorEl: null,
}

export default InfoWithPopover
