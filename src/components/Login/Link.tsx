import React, { useState, useCallback, useContext, useRef } from 'react'
import DialogActions from '@mui/material/DialogActions'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Button from '@mui/material/Button'
import styled from 'styled-components'

import StoreContext from '../../storeContext'
import { db as dexie } from '../../dexieClient'
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

const Login = ({ emailErrorText, setEmailErrorText }) => {
  const { setSession } = useContext(StoreContext)

  const [email, setEmail] = useState('')

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
      // do everything to clean up so no data is left
      await supabase.auth.signOut()
      await dexie.delete()
      // TODO: destroy store
      // see: https://github.com/mobxjs/mobx-state-tree/issues/595#issuecomment-446028034
      // or better? what about mst-persist?
      setTimeout(async () => {
        console.log('signing in with:', { emailToUse })
        const { session, error } = await supabase.auth.signIn({
          email: emailToUse,
        })
        if (error) {
          // TODO: if message is 'Invalid authentication credentials', signUp
          console.log(error)
          return setEmailErrorText(error.message)
        }
        console.log('session:', session)
        setEmailErrorText('')
        setSession(session)
      })
    },
    [email, setEmailErrorText, setSession],
  )
  const onBlurEmail = useCallback(
    (e) => {
      setEmailErrorText('')
      const email = e.target.value
      fetchLogin({ email })
      setEmail(email)
    },
    [fetchLogin, setEmailErrorText],
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
        <Button color="primary" onClick={fetchLogin}>
          anmelden
        </Button>
      </DialogActions>
    </>
  )
}

export default Login
