import React, { useState } from 'react'

import MobxStore from './store'

function App() {
  console.log('App rendering')
  const store = MobxStore.create()

  return <div>hi</div>
}

export default App
