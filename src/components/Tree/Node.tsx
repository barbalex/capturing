import { useContext } from 'react'
import {
  MdChevronRight as ChevronRightIcon,
  MdExpandMore as ExpandMoreIcon,
} from 'react-icons/md'
import IconButton from '@mui/material/IconButton'
import styled from 'styled-components'
import isUuid from 'is-uuid'
import last from 'lodash/last'

import storeContext from '../../storeContext'

const Container = styled.div``
const Indent = styled.div`
  display: flex;
  align-items: center;
  font-weight: ${(props) => (props.isInActiveNodeArray ? 'bold' : 'normal')};
  ${(props) => props.isActive && 'color: red;'}
`
const Label = styled.span`
  font-size: 0.9em;
`

const Node = ({ innerRef, data, styles, handlers, state, tree }) => {
  const store = useContext(storeContext)
  const { activeNodeArray } = store
  const isInActiveNodeArray = activeNodeArray.includes(data.id)
  const isActive = data.id === last(activeNodeArray.filter((e) => isUuid.v1(e)))
  // console.log('Node', {
  //   data,
  //   isInActiveNodeArray,
  //   activeNodeArray: activeNodeArray.slice(),
  //   isSelected: state.isSelected,
  // })

  return (
    <Container ref={innerRef} style={styles.row} onClick={handlers.select}>
      <Indent
        style={styles.indent}
        isInActiveNodeArray={isInActiveNodeArray}
        isSelected={state.isSelected}
        isActive={isActive}
      >
        <IconButton aria-label="toggle" size="small">
          {state.isOpen ? (
            <ExpandMoreIcon onClick={handlers.toggle} />
          ) : (
            <ChevronRightIcon onClick={handlers.toggle} />
          )}
        </IconButton>
        <Label>{data.label}</Label>
      </Indent>
    </Container>
  )
}

export default Node
