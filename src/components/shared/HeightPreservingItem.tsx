import { useState, useEffect } from 'react'

const HeightPreservingItem = ({ children, ...props }) => {
  const [size, setSize] = useState(0)
  const knownSize = props['data-known-size']
  useEffect(() => {
    setSize((prevSize) => {
      return knownSize == 0 ? prevSize : knownSize
    })
  }, [knownSize])

  return (
    <div
      {...props}
      className="height-preserving-container"
      style={{
        '--child-height': `${size}px`,
      }}
    >
      {children}
    </div>
  )
}

export default HeightPreservingItem
