import React, { useState, useCallback } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import styled from 'styled-components'

import ErrorBoundary from '../shared/ErrorBoundary'
import Link from './Link'
import Email from './Email'

const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    min-width: 302px !important;
  }
`
const TopContainer = styled.div`
  padding: 0 24px 10px 24px;
`

const Login = () => {
  const [authType, setAuthType] = useState('link') // or: 'email'
  const [emailErrorText, setEmailErrorText] = useState('')
  const [passwordErrorText, setPasswordErrorText] = useState('')

  const onChangeAuthType = useCallback((event, at) => {
    setAuthType(at)
    setEmailErrorText('')
    setPasswordErrorText('')
  }, [])

  return (
    <ErrorBoundary>
      <StyledDialog aria-labelledby="dialog-title" open={true}>
        <DialogTitle id="dialog-title">Anmeldung</DialogTitle>
        <TopContainer>
          <ToggleButtonGroup
            color="primary"
            value={authType}
            exclusive
            onChange={onChangeAuthType}
            size="small"
          >
            <ToggleButton value="link">Email mit Link</ToggleButton>
            <ToggleButton value="password">Mit Passwort</ToggleButton>
          </ToggleButtonGroup>
        </TopContainer>
        {authType === 'link' ? (
          <Link
            emailErrorText={emailErrorText}
            setEmailErrorText={setEmailErrorText}
          />
        ) : (
          <Email
            emailErrorText={emailErrorText}
            setEmailErrorText={setEmailErrorText}
            passwordErrorText={passwordErrorText}
            setPasswordErrorText={setPasswordErrorText}
          />
        )}
      </StyledDialog>
    </ErrorBoundary>
  )
}

export default Login
