import styled from 'styled-components'
import ListItem from '@mui/material/ListItem'
import { Link } from 'react-router-dom'

import constants from '../../utils/constants'
import { ProjectTileLayer } from '../../dexieClient'

const StyledListItem = styled(ListItem)`
  min-height: ${constants.singleRowHeight};
  border-top: thin solid rgba(74, 20, 140, 0.1);
  border-bottom: ${(props) => (props['data-last'] ? '1px' : 'thin')} solid
    rgba(74, 20, 140, 0.1);
  border-collapse: collapse;
  margin: -1px 0;
  padding: 10px;
  &:hover {
    background-color: rgba(74, 20, 140, 0.03);
  }
`
type Props = {
  row: ProjectTileLayer
}

const ProjectTilelayerComponent = ({ row }: Props) => {
  return (
    <StyledListItem component={Link} to={row.id}>
      {row.label}
    </StyledListItem>
  )
}

export default ProjectTilelayerComponent
