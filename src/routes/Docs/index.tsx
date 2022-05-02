import React, { useEffect } from 'react'

const Docs = () => {
  useEffect(() => {
    document.title = 'Erfassen: Doku'
  }, [])

  return (
    <div>
      <div>docs</div>
    </div>
  )
}

export default Docs
