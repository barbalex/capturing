import styled from '@emotion/styled'
import ListItem from '@mui/material/ListItem'
import { Link } from 'react-router-dom'

import { Row } from '../../dexieClient'
import constants from '../../utils/constants'

const StyledListItem = styled(ListItem)`
  min-height: ${constants.singleRowHeight};
  border-top: thin solid rgba(74, 20, 140, 0.1);
  border-bottom: ${(props) => (props['data-last'] ? '1px' : 'thin')} solid
    rgba(74, 20, 140, 0.1);
  border-collapse: collapse;
  margin: -1px 0;
  padding: 10px;
  white-space: pre-wrap; /* needed to implement multiple whitespaces */
  &:hover {
    background-color: rgba(74, 20, 140, 0.03);
  }
`

type Props = {
  row: Row
}

// need relative="path" because:
// react-router follows route hierarchy, NOT path otherwise
// see: https://reactrouter.com/en/main/components/link#relative
const RowRow = ({ row }: Props) => (
  <StyledListItem component={Link} to={row.id} relative="path">
    {row.label}
  </StyledListItem>
)

export default RowRow
