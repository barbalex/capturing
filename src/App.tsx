import React, { useState } from 'react'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'

import MobxStore from './store'
import initiateApp from './utils/initiateApp'
import materialTheme from './utils/materialTheme'
import { Provider as MobxProvider } from './storeContext'

function App() {
  console.log('App rendering')
  const store = MobxStore.create()
  // TODO: initiate app

  return (
    <ThemeProvider theme={materialTheme}>
      <MobxProvider value={store}>
        <div>hi</div>
      </MobxProvider>
    </ThemeProvider>
  )
}

export default App
