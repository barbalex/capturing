import React, { useState, useCallback, useRef } from 'react'
import DialogActions from '@mui/material/DialogActions'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Button from '@mui/material/Button'
import styled from 'styled-components'

import { supabase } from '../../supabaseClient'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 24px;
`
const StyledInput = styled(Input)`
  &:before {
    border-bottom-color: rgba(0, 0, 0, 0.1) !important;
  }
`
const ResetButton = styled(Button)`
  text-transform: none !important;
  font-weight: 400 !important;
`

const ResetPassword = ({
  email,
  setEmail,
  emailErrorText,
  setEmailErrorText,
}) => {
  const emailInput = useRef(null)

  const onChangeEmail = useCallback(
    (e) => {
      setEmailErrorText('')
      const email = e.target.value
      if (!email) {
        setEmailErrorText('Bitte Email-Adresse eingeben')
      }
      setEmail(email)
    },
    [setEmail, setEmailErrorText],
  )

  const [resetTitle, setResetTitle] = useState('Neues Passwort setzen')
  const reset = useCallback(async () => {
    if (!email) setEmailErrorText('Bitte Email-Adresse eingeben')
    setResetTitle('...')
    const { error } = await supabase.auth.api.resetPasswordForEmail(email)
    if (error) {
      setResetTitle('Fehler: Passwort nicht zurückgesetzt')
      setTimeout(() => {
        setResetTitle('Neues Passwort setzen')
      }, 5000)
    }
    setResetTitle('Email ist unterwegs!')
    setTimeout(() => {
      setResetTitle('Neues Passwort setzen')
    }, 5000)
  }, [email, setEmailErrorText])

  return (
    <>
      <Container>
        <FormControl
          error={!!emailErrorText}
          fullWidth
          aria-describedby="emailHelper"
          variant="standard"
        >
          <InputLabel htmlFor="email">Email</InputLabel>
          <StyledInput
            id="email"
            className="user-email"
            defaultValue={email}
            onChange={onChangeEmail}
            //autoFocus
            inputRef={emailInput}
          />
          <FormHelperText id="emailHelper">{emailErrorText}</FormHelperText>
        </FormControl>
      </Container>
      <DialogActions>
        <ResetButton color="primary" onClick={reset} disabled={!email}>
          {resetTitle}
        </ResetButton>
      </DialogActions>
    </>
  )
}

export default ResetPassword
