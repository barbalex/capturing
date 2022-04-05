import React, { useEffect } from 'react'

const Docs = () => {
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
