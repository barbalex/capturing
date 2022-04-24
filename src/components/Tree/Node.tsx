import { useContext, useCallback } from 'react'
import {
  MdChevronRight as ChevronRightIcon,
  MdExpandMore as ExpandMoreIcon,
} from 'react-icons/md'
import IconButton from '@mui/material/IconButton'
import styled from 'styled-components'
import isUuid from 'is-uuid'
import last from 'lodash/last'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

import storeContext from '../../storeContext'

const Container = styled.div``
const Indent = styled.div`
  display: flex;
  align-items: center;
  font-weight: ${(props) => (props.isInActiveNodeArray ? 'bold' : 'normal')};
  ${(props) => props.isActive && 'color: red;'}
`
const Label = styled.div`
  font-size: 1em;
  flex-grow: 1;
  padding-left: 5px;
  &:hover {
    background-color: rgba(74, 20, 140, 0.05);
    cursor: pointer;
  }
`
const NoChildren = styled.div`
  width: 18px;
  color: rgba(0, 0, 0, 0.54) !important;
`

const Node = ({ innerRef, data, styles, handlers, state, tree }) => {
  const navigate = useNavigate()
  const store = useContext(storeContext)
  const { activeNodeArray } = store
  const isInActiveNodeArray = activeNodeArray.includes(data.id)
  const isActive = data.id === last(activeNodeArray.filter((e) => isUuid.v1(e)))

  const onClickIndent = useCallback(() => {
    navigate(`/${data.activeNodeArray.join('/')}`)
  }, [data, navigate])

  return (
    <Container ref={innerRef} style={styles.row}>
      <Indent
        style={styles.indent}
        isInActiveNodeArray={isInActiveNodeArray}
        isSelected={state.isSelected}
        isActive={isActive}
        onClick={onClickIndent}
      >
        <IconButton
          aria-label="toggle"
          size="small"
          onClick={handlers.toggle}
          disabled={!data.childrenCount}
        >
          {!data.childrenCount ? (
            <NoChildren>-</NoChildren>
          ) : state.isOpen ? (
            <ExpandMoreIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </IconButton>
        <Label>{data.label}</Label>
      </Indent>
    </Container>
  )
}

export default observer(Node)
