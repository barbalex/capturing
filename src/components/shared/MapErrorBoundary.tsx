import { useContext, PropsWithChildren } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import storeContext from '../../storeContext'
import { TileLayer } from '../../dexieClient'

const onReload = () => {
  window.location.reload(true)
}

interface ErrorFallbackProps {
  error: Error
  addNotification: (notification: { title: string; message: string }) => void
  layer: TileLayer
}

const ErrorFallback = ({
  error,
  addNotification,
  layer,
}: ErrorFallbackProps) => {
  const layerName =
    layer._layerOptions.find((o) => o.value === layer.type_name)?.label ??
    layer.type_name
  addNotification({
    title: `Fehler in Vektor-Layer '${layerName}'`,
    message: `${error.message}`,
  })

  return null
}

interface Props {
  layer: TileLayer
}

const MyErrorBoundary = ({ children, layer }): PropsWithChildren<Props> => {
  const { addNotification } = useContext(storeContext)

  return (
    <ErrorBoundary
      FallbackComponent={({ error, componentStack, resetErrorBoundary }) =>
        ErrorFallback({
          error,
          componentStack,
          resetErrorBoundary,
          addNotification,
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
