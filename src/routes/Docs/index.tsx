import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const Docs = () => {
  const location = useLocation()
  console.log('Docs, params:', location)

  useEffect(() => {
    document.title = 'Capturing: Docs'
  }, [])

  return (
    <div>
      <div>docs</div>
    </div>
  )
}

export default Docs
