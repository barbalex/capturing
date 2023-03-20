import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import styled from '@emotion/styled'
import Button from '@mui/material/Button'

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
  window.location.reload(true)
}

interface Props {
  error: Error
  componentStack: string
  resetErrorBoundary: () => void
}

const ErrorFallback = ({
  error,
  componentStack,
  resetErrorBoundary,
}: Props) => (
  <Container>
    <p>Sorry, ein Fehler ist aufgetreten:</p>
    <PreWrapping>{error.message}</PreWrapping>
    <Details>
      <Summary>Mehr Informationen</Summary>
      <Pre>{componentStack}</Pre>
    </Details>
    <ButtonContainer>
      <Button variant="outlined" onClick={onReload} color="inherit">
        neu starten
      </Button>
    </ButtonContainer>
    <ButtonContainer>
      <Button variant="outlined" onClick={resetErrorBoundary} color="inherit">
        Cache leeren und neu starten (neue Anmeldung nötig)
      </Button>
    </ButtonContainer>
  </Container>
)

const MyErrorBoundary = ({ children }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback} onReset={onReload}>
    {children}
  </ErrorBoundary>
)

export default MyErrorBoundary
