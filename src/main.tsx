import React from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import 'simplebar/dist/simplebar.min.css'

import './globals.css'
import App from './App'

// https://vite-plugin-pwa.netlify.app/guide/prompt-for-update.html#runtime
registerSW({
  onNeedRefresh() {
    if (
      window.confirm(
        'capturing.app neu laden, um die neuste Version zu installieren?',
      )
    ) {
      // TODO: empty everything but the login?
      // seems that is what is happening
      window.location.reload(true)
    }
  },
  onOfflineReady() {
    console.log('the service worker is offline ready')
  },
})
const container = document.getElementById('root')
const root = createRoot(container)

root.render(<App />)
