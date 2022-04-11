import React, { useState, useCallback, useRef, useContext } from 'react'
import DialogActions from '@mui/material/DialogActions'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Button from '@mui/material/Button'
import styled from 'styled-components'

import { dexie } from '../../dexieClient'
import { supabase } from '../../supabaseClient'
import storeContext from '../../storeContext'
import logout from '../../utils/logout'

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

const Login = ({ emailErrorText, setEmailErrorText, email, setEmail }) => {
  const store = useContext(storeContext)

  const emailInput = useRef(null)

  const fetchLogin = useCallback(
    // callbacks pass email or password
    // because state is not up to date yet
    async ({ email: emailPassed }) => {
      // need to fetch values from ref
      // why? password-managers enter values but do not blur/change
      // if password-manager enters values and user clicks "Anmelden"
      // it will not work without previous blurring
      const emailToUse = emailPassed ?? email ?? emailInput.current.value
      await logout({ store })
      setTimeout(async () => {
        const { error } = await supabase.auth.signIn({
          email: emailToUse,
        })
        if (error) {
          console.log(error)
          // if message is 'Invalid authentication credentials', signUp
          if (error.message === 'Invalid authentication credentials') {
            return setEmailErrorText(
              `${error.message}. Vielleicht funktioniert es mit Passwort`,
            )
          }
          return setEmailErrorText(error.message)
        }
        setEmailErrorText('')
      })
    },
    [email, setEmailErrorText, store],
  )
  const onBlurEmail = useCallback(
    (e) => {
      setEmailErrorText('')
      const email = e.target.value
      fetchLogin({ email })
      setEmail(email)
    },
    [fetchLogin, setEmail, setEmailErrorText],
  )
  const onKeyPressEmail = useCallback(
    (e) => {
      e.key === 'Enter' && onBlurEmail(e)
    },
    [onBlurEmail],
  )

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
            onBlur={onBlurEmail}
            //autoFocus
            onKeyPress={onKeyPressEmail}
            inputRef={emailInput}
          />
          <FormHelperText id="emailHelper">{emailErrorText}</FormHelperText>
        </FormControl>
      </Container>
      <DialogActions>
        <Button color="primary">anmelden</Button>
      </DialogActions>
    </>
  )
}

export default Login
