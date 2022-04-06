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
import styled from 'styled-components'

import storeContext from '../../storeContext'
import { db as dexie } from '../../dexieClient'
import { supabase } from '../../supabaseClient'
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
const ResetButton = styled(Button)`
  text-transform: none !important;
  font-weight: 400 !important;
  margin-left: 8px !important;
  margin-right: 20px !important;
`

const Login = ({
  emailErrorText,
  setEmailErrorText,
  passwordErrorText,
  setPasswordErrorText,
}) => {
  const store = useContext(storeContext)
  const { setSession } = store

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

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
      const emailToUse = emailPassed ?? email ?? emailInput.current.value
      const passwordToUse =
        passwordPassed ?? password ?? passwordInput.current.value
      await logout({ store })
      setTimeout(async () => {
        console.log('signing in with:', { emailToUse, passwordToUse })
        const { session, error } = await supabase.auth.signIn({
          email: emailToUse,
          password: passwordToUse,
        })
        if (error) {
          // TODO: if message is 'Invalid authentication credentials', signUp
          console.log(error)
          setEmailErrorText(error.message)
          return setPasswordErrorText(error.message)
        }
        console.log('session:', session)
        setEmailErrorText('')
        setPasswordErrorText('')
        setSession(session)
      })
    },
    [
      email,
      password,
      setEmailErrorText,
      setPasswordErrorText,
      setSession,
      store,
    ],
  )
  const onBlurEmail = useCallback(
    (e) => {
      setEmailErrorText('')
      const email = e.target.value
      if (!email) {
        setEmailErrorText('Bitte Email-Adresse eingeben')
      } else if (password) {
        fetchLogin({ email })
      }
      setEmail(email)
    },
    [fetchLogin, password, setEmailErrorText],
  )
  const onBlurPassword = useCallback(
    (e) => {
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
    (e) => {
      e.key === 'Enter' && onBlurEmail(e)
    },
    [onBlurEmail],
  )
  const onKeyPressPassword = useCallback(
    (e) => e.key === 'Enter' && onBlurPassword(e),
    [onBlurPassword],
  )
  const onClickShowPass = useCallback(() => setShowPass(!showPass), [showPass])
  const onMouseDownShowPass = useCallback((e) => e.preventDefault(), [])

  const [resetTitle, setResetTitle] = useState('neues Passwort setzen')
  const reset = useCallback(async () => {
    if (!email) setEmailErrorText('Bitte Email-Adresse eingeben')
    setResetTitle('...')
    const { error } = await supabase.auth.api.resetPasswordForEmail(email)
    if (error) {
      setResetTitle('Fehler: Passwort nicht zurückgesetzt')
      setTimeout(() => {
        setResetTitle('neues Passwort setzen')
      }, 5000)
    }
    setResetTitle('Email ist unterwegs!')
    setTimeout(() => {
      setResetTitle('neues Passwort setzen')
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
        {!!email && (
          <ResetButton onClick={reset} color="inherit">
            {resetTitle}
          </ResetButton>
        )}
        <Button color="primary" onClick={fetchLogin}>
          anmelden
        </Button>
      </DialogActions>
    </>
  )
}

export default Login
