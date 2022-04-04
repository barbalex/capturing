import React, { useState } from 'react'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import MobxStore from './store'
import initiateApp from './utils/initiateApp'
import materialTheme from './utils/materialTheme'
import { Provider as MobxProvider } from './storeContext'
import Home from './routes/Home'
import Docs from './routes/Docs'

function App() {
  console.log('App rendering')
  const store = MobxStore.create()
  // TODO: initiate app
  // detect type = recovery to open reset password modal
  if (typeof window !== 'undefined') {
    const urlSearchParams = new URLSearchParams(window.location.search)
    const params = Object.fromEntries(urlSearchParams.entries())
    if (params?.type === 'recovery') {
      console.log('Layout, setting resetPassword to true')
      return store.setResetPassword(true)
    }
  }

  return (
    <BrowserRouter>
      <ThemeProvider theme={materialTheme}>
        <MobxProvider value={store}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="docs" element={<Docs />} />
          </Routes>
        </MobxProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
