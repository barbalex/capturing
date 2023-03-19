import React, { useState, useCallback, useContext, useRef } from 'react'
import DialogActions from '@mui/material/DialogActions'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import {
  MdVisibility as VisibilityIcon,
  MdVisibilityOff as VisibilityOffIcon,
} from 'react-icons/md'
import Button from '@mui/material/Button'
import styled from '@emotion/styled'

import storeContext from '../../storeContext'
import { supabase } from '../../supabaseClient'
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
const LoginWithEmailAndPassword = ({
  email,
  setEmail,
  emailErrorText,
  setEmailErrorText,
  passwordErrorText,
  setPasswordErrorText,
  authType,
}) => {
  const store: IStore = useContext(storeContext)

  const [password, setPassword] = useState<string>('')
  const [showPass, setShowPass] = useState<boolean>(false)

  const emailInput = useRef(null)
  const passwordInput = useRef(null)

  const fetchLogin = useCallback(
    // callbacks pass email or password
    // because state is not up to date yet
    async ({ email: emailPassed, password: passwordPassed }) => {
      // need to fetch values from ref
      // why? password-managers enter values but do not blur/change
      // if password-manager enters values and user clicks "Anmelden"
      // it will not work without previous blurring
      const emailToUse: string =
        emailPassed ?? email ?? emailInput.current.value
      const passwordToUse: string =
        passwordPassed ?? password ?? passwordInput.current.value
      await logout({ store })
      setTimeout(async () => {
        // using signUp after link: error.message = 'User already registered'
        // using signIn after link / without signUp: error.message = 'Invalid login credentials'
        // using link after signUp: works
        const { error } =
          authType === 'email_signup'
            ? await supabase.auth.signUp({
                email: emailToUse,
                password: passwordToUse,
              })
            : await supabase.auth.signInWithPassword({
                email: emailToUse,
                password: passwordToUse,
              })
        if (error) {
          // TODO: if message is 'Invalid authentication credentials', signUp
          console.log(error)
          if (
            error.message === 'User already registered' &&
            authType === 'email_signup'
          ) {
            console.log('signing in instead of up')
            return await supabase.auth.signInWithPassword({
              email: emailToUse,
              password: passwordToUse,
            })
          }
          if (error.message === 'Invalid login credentials') {
            // propose to change/set password or create account
            setEmailErrorText(`${error.message}. Neues Konto erstellen?`)
            setPasswordErrorText(`${error.message}. Neues Passwort setzen?`)
            return
          }
          setEmailErrorText(error.message)
          return setPasswordErrorText(error.message)
        }
        setEmailErrorText('')
        setPasswordErrorText('')
      })
    },
    [authType, email, password, setEmailErrorText, setPasswordErrorText, store],
  )
  const onBlurEmail = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEmailErrorText('')
      const email = e.target.value
      if (!email) {
        setEmailErrorText('Bitte Email-Adresse eingeben')
      } else if (password) {
        fetchLogin({ email })
      }
      setEmail(email)
    },
    [fetchLogin, password, setEmail, setEmailErrorText],
  )
  const onBlurPassword = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setPasswordErrorText('')
      const password = e.target.value
      setPassword(password)
      if (!password) {
        setPasswordErrorText('Bitte Passwort eingeben')
      } else if (email) {
        fetchLogin({ password })
      }
    },
    [setPasswordErrorText, email, fetchLogin],
  )
  const onKeyPressEmail = useCallback(
    (e: React.KeyboardEvent) => {
      e.key === 'Enter' && onBlurEmail(e)
    },
    [onBlurEmail],
  )
  const onKeyPressPassword = useCallback(
    (e: React.KeyboardEvent) => e.key === 'Enter' && onBlurPassword(e),
    [onBlurPassword],
  )
  const onClickShowPass = useCallback(() => setShowPass(!showPass), [showPass])
  const onMouseDownShowPass = useCallback(
    (e: React.MouseEvent) => e.preventDefault(),
    [],
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
        <FormControl
          error={!!passwordErrorText}
          fullWidth
          aria-describedby="passwortHelper"
          variant="standard"
        >
          <InputLabel htmlFor="passwort">Passwort</InputLabel>
          <StyledInput
            id="passwort"
            className="user-passwort"
            type={showPass ? 'text' : 'password'}
            defaultValue={password}
            onBlur={onBlurPassword}
            onKeyPress={onKeyPressPassword}
            autoComplete="current-password"
            autoCorrect="off"
            spellCheck="false"
            inputRef={passwordInput}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={onClickShowPass}
                  onMouseDown={onMouseDownShowPass}
                  title={showPass ? 'verstecken' : 'anzeigen'}
                  size="large"
                >
                  {showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            }
          />
          <FormHelperText id="passwortHelper">
            {passwordErrorText}
          </FormHelperText>
        </FormControl>
      </Container>
      <DialogActions>
        <Button color="primary">anmelden</Button>
      </DialogActions>
    </>
  )
}

export default LoginWithEmailAndPassword
