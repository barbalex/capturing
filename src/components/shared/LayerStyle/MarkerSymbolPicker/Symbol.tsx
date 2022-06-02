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

  if (active) {
    return (
      <Component
        style={{
          backgroundColor: active ? 'rgba(74, 20, 140, 0.1)' : 'unset',
          outline: active ? '2px solid rgba(74, 20, 140, 1)' : 'unset',
        }}
      />
    )
  }

  return <Component onClick={onClick} />
}

export default Symbol
