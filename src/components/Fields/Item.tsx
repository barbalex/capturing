import styled from '@emotion/styled'
import ListItem from '@mui/material/ListItem'
import { Link } from 'react-router-dom'

import constants from '../../utils/constants'
import labelFromLabeledTable from '../../utils/labelFromLabeledTable'
import { Field } from '../../dexieClient'

const StyledListItem = styled(ListItem)`
  height: ${constants.singleRowHeight};
  border-top: thin solid rgba(74, 20, 140, 0.1);
  border-bottom: ${(props) => (props['data-last'] ? '1px' : 'thin')} solid
    rgba(74, 20, 140, 0.1);
  border-collapse: collapse;
  margin: -1px 0;
  padding: 10px;
  ${(props) =>
    props.isdragging === 'true' &&
    `
    /*background: rgba(230, 81, 0, 0.1);*/
    background: rgba(74, 20, 140, 0.1);
    border-color: #E65100;
    box-shadow: 0px 0px 2px rgba(74, 20, 140, 1), 0px 0px 10px rgba(74, 20, 140, 1);
  `}
  &:hover {
    background-color: rgba(74, 20, 140, 0.03);
  }
`

interface Props {
  item: Field
  project: Project | undefined
  provided: DraggableProvided
  isDragging: boolean
}

const FieldRow = ({ item, project, provided, isDragging }: Props) => {
  const label = labelFromLabeledTable({
    object: item,
    useLabels: project?.use_labels,
  })

  return (
    <StyledListItem
      component={Link}
      to={item.id}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
      style={provided.draggableProps.style}
      isdragging={isDragging?.toString()}
    >
      {label}
    </StyledListItem>
  )
}

export default FieldRow
