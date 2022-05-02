import React, { useEffect } from 'react'

const Docs = () => {
  useEffect(() => {
    document.title = 'Capturing: Doku'
  }, [])

  return (
    <div>
      <div>docs</div>
    </div>
  )
}

export default Docs
