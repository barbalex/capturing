import { useContext } from 'react'
import styled from '@emotion/styled'
import ListItem from '@mui/material/ListItem'
import { Link, useParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

import constants from '../../utils/constants'
import labelFromLabeledTable from '../../utils/labelFromLabeledTable'
import storeContext from '../../storeContext'

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

const TableRow = ({ row, useLabels }) => {
  const { projectId } = useParams()
  const store = useContext(storeContext)
  const { editingProjects } = store
  const editing = editingProjects.get(projectId)?.editing ?? false

  const label = labelFromLabeledTable({
    object: row,
    useLabels,
  })

  const to = editing ? row.id : `${row.id}/rows`

  return (
    <StyledListItem component={Link} to={to}>
      {label}
    </StyledListItem>
  )
}

export default observer(TableRow)
