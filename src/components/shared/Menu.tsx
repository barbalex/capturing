import React, { useState, useCallback, PropsWithChildren } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import { FaBars } from 'react-icons/fa'
import styled from '@emotion/styled'

const StyledMenu = styled(Menu)`
  ul {
    display: flex;
    flex-direction: column;
  }
`
const MenuButton = styled(IconButton)`
  ${(props) => props['data-white'] && 'color: white !important;'}
`

interface Props {
  title?: string
  white?: boolean
}

const HeaderMenu = ({
  children,
  title = 'Menu',
  white = true,
}): PropsWithChildren<Props> => {
  const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement>(null)
  const closeMenu = useCallback(() => {
    setAnchorEl(null)
  }, [])
  const onClickButton = useCallback(
    (event) => setAnchorEl(event.currentTarget),
    [],
  )

  return (
    <>
      <MenuButton
        aria-controls="menu"
        aria-haspopup="true"
        aria-label={title}
        title={title}
        onClick={onClickButton}
        data-white={white}
      >
        <FaBars />
      </MenuButton>
      <StyledMenu
        id="menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={closeMenu}
      >
        {children}
      </StyledMenu>
    </>
  )
}

export default observer(HeaderMenu)
