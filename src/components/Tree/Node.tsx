import {
  MdChevronRight as ChevronRightIcon,
  MdExpandMore as ExpandMoreIcon,
  MdMoreHoriz as MoreHorizIcon, // loading
} from 'react-icons/md'

const Node = ({ innerRef, data, styles, handlers, state, tree }) => {
  return (
    <div ref={innerRef} style={styles.row} onClick={handlers.select}>
      <div style={styles.indent}>
        {state.isOpen ? <ExpandMoreIcon /> : <ChevronRightIcon />}
        <span>{data.label}</span>
      </div>
    </div>
  )
}

export default Node
