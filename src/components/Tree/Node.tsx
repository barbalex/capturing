import { useContext } from 'react'
import {
  MdChevronRight as ChevronRightIcon,
  MdExpandMore as ExpandMoreIcon,
  MdMoreHoriz as MoreHorizIcon, // loading
} from 'react-icons/md'
import styled from 'styled-components'

import storeContext from '../../storeContext'

const Container = styled.div``
const Indent = styled.div`
  font-weight: ${(props) => (props.isActive ? 'bold' : 'normal')};
`

const Node = ({ innerRef, data, styles, handlers, state, tree }) => {
  const store = useContext(storeContext)
  const { activeNodeArray } = store
  const isActive = activeNodeArray.includes(data.id)
  console.log('Node', {
    data,
    isActive,
    activeNodeArray: activeNodeArray.slice(),
  })

  return (
    <Container ref={innerRef} style={styles.row} onClick={handlers.select}>
      <Indent style={styles.indent} isActive={isActive}>
        {state.isOpen ? (
          <ExpandMoreIcon onClick={handlers.toggle} />
        ) : (
          <ChevronRightIcon onClick={handlers.toggle} />
        )}
        <span>{data.label}</span>
      </Indent>
    </Container>
  )
}

export default Node
