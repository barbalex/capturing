import { useContext } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import styled from 'styled-components'
import Button from '@mui/material/Button'

import storeContext from '../../storeContext'

const Container = styled.div`
  padding: 15px;
`
const ButtonContainer = styled.div`
  margin-right: 10px;
  margin-bottom: 10px;
`
const Details = styled.details`
  margin-bottom: 25px;
`
const Summary = styled.summary`
  user-select: none;
  &:focus {
    outline: none !important;
  }
`
const PreWrapping = styled.pre`
  white-space: normal;
`
const Pre = styled.pre`
  background-color: rgba(128, 128, 128, 0.09);
`

const onReload = () => {
  if (typeof window !== 'undefined') {
    window.location.reload(true)
  }
}

const ErrorFallback = ({ error, store, layer }) => {
  const layerName =
    layer._layerOptions.find((o) => o.value === layer.type_name)?.label ??
    layer.type_name
  store.addNotification({
    title: `Fehler in Vektor-Layer '${layerName}'`,
    message: `${error.message}`,
  })

  return null
}

const MyErrorBoundary = ({ children, layer }) => {
  const store = useContext(storeContext)

  return (
    <ErrorBoundary
      FallbackComponent={({ error, componentStack, resetErrorBoundary }) =>
        ErrorFallback({
          error,
          componentStack,
          resetErrorBoundary,
          store,
          layer,
        })
      }
      onReset={onReload}
    >
      {children}
    </ErrorBoundary>
  )
}

export default MyErrorBoundary
