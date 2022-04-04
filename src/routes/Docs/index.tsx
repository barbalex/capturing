import React, { useEffect } from 'react'

const docs = () => {
  useEffect(() => {
    document.title = 'Capturing: Docs'
  }, [])

  return (
    <div>
      <div>docs</div>
    </div>
  )
}

export default docs
