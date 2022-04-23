import React from 'react'

const Tree = React.forwardRef((props, ref) => {
  return <div ref={ref}>tree</div>
})

export default Tree
