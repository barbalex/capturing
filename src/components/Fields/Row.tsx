import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import ListItem from '@mui/material/ListItem'
import { Link } from 'react-router-dom'

import StoreContext from '../../storeContext'
import constants from '../../utils/constants'
import labelFromLabeledTable from '../../utils/labelFromLabeledTable'
import { dexie, Field } from '../../dexieClient'

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

const FieldRow = ({ row }) => {
  const store = useContext(StoreContext)
  const { activeNodeArray } = store
  const { projectId } = useParams()

  const project: Field = useLiveQuery(
    async () => await dexie.projects.where({ id: projectId }).first(),
    [projectId],
  )

  const label = labelFromLabeledTable({
    object: row,
    useLabels: project?.use_labels,
  })

  return (
    <StyledListItem
      component={Link}
      to={`/${[...activeNodeArray, row.id].join('/')}`}
    >
      {label}
    </StyledListItem>
  )
}

export default observer(FieldRow)
