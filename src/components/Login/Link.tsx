import React, { useState, useCallback, useRef, useContext } from 'react'
import DialogActions from '@mui/material/DialogActions'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Button from '@mui/material/Button'
import styled from '@emotion/styled'

import { supabase } from '../../supabaseClient'
import storeContext from '../../storeContext'
import logout from '../../utils/logout'
import { IStore } from '../../store'

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

interface Props {
  email: string
  setEmail: (email: string) => void
  emailErrorText: string
  setEmailErrorText: (emailErrorText: string) => void
}

const Login = ({
  emailErrorText,
  setEmailErrorText,
  email,
  setEmail,
}: Props) => {
  const store: IStore = useContext(storeContext)

  const [buttonTxt, setButtonTxt] = useState<string>('anmelden')

  const emailInput = useRef(null)

  const fetchLogin = useCallback(
    // callbacks pass email or password
    // because state is not up to date yet
    async ({ email: emailPassed }: { email: string | undefined }) => {
      setButtonTxt('Email wird verschickt...')
      // need to fetch values from ref
      // why? password-managers enter values but do not blur/change
      // if password-manager enters values and user clicks "Anmelden"
      // it will not work without previous blurring
      const emailToUse = emailPassed ?? email ?? emailInput.current.value
      await logout({ store })
      setTimeout(async () => {
        const { error } = await supabase.auth.signInWithOtp({
          email: emailToUse,
        })
        if (error) {
          console.log(error)
          setButtonTxt('anmelden')
          // if message is 'Invalid authentication credentials', signUp
          if (error.message === 'Invalid authentication credentials') {
            return setEmailErrorText(
              `${error.message}. Vielleicht funktioniert es mit Passwort`,
            )
          }
          return setEmailErrorText(error.message)
        }
        setEmailErrorText('')
        setButtonTxt('Email wurde verschickt!')
        setTimeout(() => {
          setButtonTxt('anmelden')
        }, 5000)
      })
    },
    [email, setEmailErrorText, store],
  )
  const onBlurEmail = useCallback(
    (e: React.FocusEvent) => {
      setEmailErrorText('')
      const email: string | undefined = e.target.value
      if (!email) return
      fetchLogin({ email })
      setEmail(email)
    },
    [fetchLogin, setEmail, setEmailErrorText],
  )
  const onKeyPressEmail = useCallback(
    (e: React.KeyboardEvent) => {
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
            autoFocus
            onKeyPress={onKeyPressEmail}
            inputRef={emailInput}
          />
          <FormHelperText id="emailHelper">{emailErrorText}</FormHelperText>
        </FormControl>
      </Container>
      <DialogActions>
        <Button color="primary">{buttonTxt}</Button>
      </DialogActions>
    </>
  )
}

export default Login
