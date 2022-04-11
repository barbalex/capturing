import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import styled from 'styled-components'
import Typography from '@mui/material/Typography'
import MaterialCard from '@mui/material/Card'
import SimpleBar from 'simplebar-react'

import ErrorBoundary from '../components/shared/ErrorBoundary'
import constants from '../utils/constants'

const StyledSimpleBar = styled(SimpleBar)`
  max-height: calc(100vh - ${constants.appBarHeight}px);
  height: calc(100% - ${constants.appBarHeight}px);
  .simplebar-scrollbar:before {
    background: #4a148c !important;
    /*background: grey !important;*/
  }
`
const ScrollContainer = styled.div`
  height: calc(100% - ${constants.appBarHeight}px);
  .simplebar-content {
    height: calc(100% - ${constants.appBarHeight}px);
  }
`
const Container = styled.div`
  margin: 15px;
  position: relative;
  height: calc(100% - ${constants.appBarHeight}px);
  @media (min-width: 700px) {
    margin: 20px;
  }
  @media (min-width: 1200px) {
    margin: 25px;
  }
  @media (min-width: 1700px) {
    margin: 30px;
  }
`
const CardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-column-gap: 15px;
  grid-row-gap: 15px;
  @media (min-width: 700px) {
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 20px;
    grid-row-gap: 20px;
  }
  @media (min-width: 1200px) {
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: 25px;
    grid-row-gap: 25px;
  }
  @media (min-width: 1700px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-column-gap: 30px;
    grid-row-gap: 30px;
  }
  p {
    margin-bottom: 10px !important;
  }
  p:last-of-type {
    margin-bottom: 0 !important;
    margin-top: 10px !important;
  }
`
const Card = styled(MaterialCard)`
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.65) !important;
  font-weight: 500;
  ul {
    margin-bottom: 0;
  }
  li:last-of-type {
    margin-bottom: 0;
  }
  li {
    font-weight: 500;
  }
`
const PageTitle = styled(Typography)`
  font-size: 2em !important;
  padding-bottom: 15px;
  font-weight: 700 !important;
  text-shadow: 2px 2px 3px white, -2px -2px 3px white, 2px -2px 3px white,
    -2px 2px 3px white;
  @media (min-width: 700px) {
    padding-bottom: 20px;
  }
  @media (min-width: 1200px) {
    padding-bottom: 25px;
  }
  @media (min-width: 1700px) {
    padding-bottom: 30px;
  }
`
const CardTitle = styled.h3`
  font-weight: 700;
`

const Home = () => {
  useEffect(() => {
    document.title = 'Capturing: Home'
  }, [])

  return (
    <ErrorBoundary>
      <StyledSimpleBar>
        <ScrollContainer>
          <Container>
            <PageTitle align="center" variant="h6" color="inherit">
              Erfassen Sie Daten:
            </PageTitle>
            <CardContainer>
              <Card>
                <CardTitle>Aller Art</CardTitle>
                Text, Pläne, Fotos, Audio, beliebige Dateien.
              </Card>
              <Card>
                <CardTitle>Wie Sie wollen</CardTitle>
                Daten-Strukturen sind individuell und flexibel konfigurierbar.
              </Card>
              <Card>
                <CardTitle>Wo Sie wollen</CardTitle>
                Kein Internet-Empfang? Egal!
              </Card>
              <Card>
                <CardTitle>Mit wem Sie wollen</CardTitle>
                <p>Neue Mitarbeiter einfach und rasch ergänzen.</p>
                <p>Es können beliebig viele Personen mitarbeiten.</p>
              </Card>
              <Card>
                <CardTitle>Wann Sie wollen</CardTitle>
                Daten werden live synchronisiert.
              </Card>
              <Card>
                <CardTitle>Mit dem Gerät Ihrer Wahl</CardTitle>
                <p>Handy, Tablet, Notebook, PC…</p>
                <p>Windows, MacOS, Android, iOS, Linux…</p>
              </Card>
              <Card>
                <CardTitle>Mit minimalem Aufwand</CardTitle>
                <p>Nur einmal vor- und nachbereiten.</p>
                <p>Egal wie viele Mitarbeiter.</p>
              </Card>
            </CardContainer>
          </Container>
        </ScrollContainer>
      </StyledSimpleBar>
    </ErrorBoundary>
  )
}

export default observer(Home)
