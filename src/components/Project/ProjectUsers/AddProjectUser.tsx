import { useCallback } from 'react'
import styled from 'styled-components'
import { useLiveQuery } from 'dexie-react-hooks'

import TextField from '../../shared/TextField'
import { dexie, ProjectUser, RoleTypeEnum } from '../../../dexieClient'

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
`

const roleTypes = [
  {
    value: 'project_reader',
    label: "project_reader: read a project's data",
  },
  {
    value: 'project_editor',
    label: 'project_editor: project_reader plus: edit rows and files',
  },
  {
    value: 'project_manager',
    label:
      'project_manager: project_editor plus: edit projects and their structure (tables, fields, layers)',
  },
  {
    value: 'account_manager',
    label:
      'account_manager: project_manager plus: create projects, create project users and give them roles, ',
  },
]

const AddProjectUser = () => {
  console.log('AddProjectUser, RoleTypeEnum', RoleTypeEnum)
  const onBlur = useCallback(() => {
    // TODO:
  }, [])

  return (
    <Container>
      <TextField
        value=""
        label="Email-Adresse"
        type="email"
        name="user_email"
      />
    </Container>
  )
}

export default AddProjectUser
