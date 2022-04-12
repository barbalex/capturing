import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'

import StoreContext from '../../storeContext'
import constants from '../../utils/constants'
import { dexie, Project } from '../../dexieClient'

const Row = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: ${constants.singleRowHeight};
  border-top: thin solid rgba(74, 20, 140, 0.1);
  border-bottom: ${(props) => (props['data-last'] ? '1px' : 'thin')} solid
    rgba(74, 20, 140, 0.1);
  border-collapse: collapse;
  margin: -1px 0;
  padding: 10px;
  cursor: pointer;
  div {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  &:hover {
    background-color: rgba(74, 20, 140, 0.03);
  }
`

const TableRow = ({ row }) => {
  const store = useContext(StoreContext)
  const { activeNodeArray } = store
  const { projectId } = useParams()
  const navigate = useNavigate()

  const project: Project = useLiveQuery(
    async () => await dexie.projects.where({ id: projectId }).first(),
  )

  const onClickRow = useCallback(
    () => navigate(`/${[...activeNodeArray, row.id].join('/')}`),
    [activeNodeArray, navigate, row.id],
  )
  const label =
    project?.use_labels === 1 && row.label
      ? row.label
      : row.name ?? '(unbenannt)'

  return (
    <Row onClick={onClickRow}>
      <div>{label}</div>
    </Row>
  )
}

export default observer(TableRow)
