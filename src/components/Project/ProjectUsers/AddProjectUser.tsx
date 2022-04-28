import { useCallback } from 'react'
import styled from 'styled-components'
import { useLiveQuery } from 'dexie-react-hooks'

import TextField from '../../shared/TextField'
import { dexie, ProjectUser } from '../../../dexieClient'

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
`

const AddProjectUser = () => {
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
