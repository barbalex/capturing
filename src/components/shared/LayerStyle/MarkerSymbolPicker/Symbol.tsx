import { useCallback } from 'react'

const Symbol = ({ Component, name, onBlur, active }) => {
  const onClick = useCallback(() => {
    onBlur({
      target: {
        name: 'marker_symbol',
        value: name,
      },
    })
  }, [name, onBlur])

  return (
    <Component
      onClick={onClick}
      style={{ backgroundColor: active ? 'rgba(74, 20, 140, 0.1)' : 'unset' }}
    />
  )
}

export default Symbol
