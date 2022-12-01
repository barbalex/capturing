import React, { useState, useCallback } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import styled from '@emotion/styled'

import ErrorBoundary from '../shared/ErrorBoundary'
import Link from './Link'
import Email from './Email'
import ResetPassword from './ResetPassword'

const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    min-width: 302px !important;
  }
`
const TopContainer = styled.div`
  padding: 0 24px 15px 24px;
`
const StyledToggleButton = styled(ToggleButton)`
  display: flex;
  flex-direction: column;
`
const ButtonComment = styled.div`
  font-size: x-small;
  line-height: 13px;
`

const Login = () => {
  const [authType, setAuthType] = useState('link') // values: ['link', 'email', 'email_signup', 'email_reset']
  const [email, setEmail] = useState('')
  const [emailErrorText, setEmailErrorText] = useState('')
  const [passwordErrorText, setPasswordErrorText] = useState('')

  const onChangeAuthType = useCallback(async (event, at) => {
    // returns null when active auth type was clicked
    if (!at) return
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
            orientation="vertical"
            fullWidth
          >
            <StyledToggleButton value="link">
              <div>Email mit Link </div>
              <ButtonComment>
                Sie erhalten ein Email mit einem Anmelde-Link.
              </ButtonComment>
              <ButtonComment>Konto wird automatisch erstellt.</ButtonComment>
            </StyledToggleButton>
            <StyledToggleButton value="email_signup">
              Konto mit Email und Passwort erstellen
            </StyledToggleButton>
            <StyledToggleButton value="email">
              Mit Email und Passwort anmelden
            </StyledToggleButton>
            <StyledToggleButton value="email_reset">
              <div>Neues Passwort setzen</div>
              <ButtonComment>
                Sie erhalten ein Email mit einem Link,
              </ButtonComment>
              <ButtonComment>um ein neues Passwort zu setzen.</ButtonComment>
            </StyledToggleButton>
          </ToggleButtonGroup>
        </TopContainer>
        {authType === 'link' ? (
          <Link
            email={email}
            setEmail={setEmail}
            emailErrorText={emailErrorText}
            setEmailErrorText={setEmailErrorText}
          />
        ) : authType === 'email_reset' ? (
          <ResetPassword
            email={email}
            setEmail={setEmail}
            emailErrorText={emailErrorText}
            setEmailErrorText={setEmailErrorText}
          />
        ) : (
          <Email
            authType={authType}
            email={email}
            setEmail={setEmail}
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
