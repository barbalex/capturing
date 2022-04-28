import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import TextField from '../../shared/TextField'
import RadioButtonGroup from '../../shared/RadioButtonGroup'
import { dexie, ProjectUser, RoleTypeEnum } from '../../../dexieClient'
import insertProjectUser from '../../../utils/insertProjectUser'

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
  border-top: 1px solid rgba(74, 20, 140, 0.1);
`
const Title = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
`

const roleTypes = [
  {
    value: 'project_reader',
    label: "project_reader: read a project's data",
  },
  {
    value: 'project_editor',
    label: 'project_editor: additionally: edit rows and files',
  },
  {
    value: 'project_manager',
    label:
      'project_manager: additionally: edit projects and their structure (tables, fields, layers)',
  },
  {
    value: 'account_manager',
    label:
      'account_manager: additionally: create projects, create project users and give them roles',
  },
]

const AddProjectUser = ({ setAddNew }) => {
  const { projectId } = useParams()

  const [state, setState] = useState({ user_email: '', role: undefined })
  const onBlur = useCallback(
    (e) => {
      setState({ ...state, [e.target.name]: e.target.value })
      if (state.user_email && state.role) {
        // TODO: insert project_user
        insertProjectUser({
          projectId,
          email: state.user_email,
          role: state.role,
        })
        setAddNew(false)
      }
    },
    [projectId, setAddNew, state],
  )

  return (
    <Container>
      <Title>Neue mitarbeitende Person</Title>
      <TextField
        value=""
        label="Email-Adresse"
        type="email"
        name="user_email"
        onBlur={onBlur}
      />
      <RadioButtonGroup
        value=""
        label="Rolle"
        labelSize={0.8}
        name="role"
        dataSource={roleTypes}
        onBlur={onBlur}
      />
    </Container>
  )
}

export default AddProjectUser
