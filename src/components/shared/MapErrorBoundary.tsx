import { useContext } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import storeContext from '../../storeContext'

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
