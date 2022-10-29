import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import styled from 'styled-components'
import Typography from '@mui/material/Typography'
import MaterialCard from '@mui/material/Card'

import ErrorBoundary from '../components/shared/ErrorBoundary'
import constants from '../utils/constants'
import image from '../images/puls_vulg.jpg'
import placeholderSrc from '../images/puls_vulg_small.jpg'
import ProgressiveImg from '../components/shared/ProgressiveImg'

const OuterContainer = styled.div`
  height: calc(100% - ${constants.appBarHeight}px);
  position: relative;
  overflow: hidden;
`
const ScrollContainer = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  overflow-y: auto;
  /* prevent layout shift when scrollbar appears */
  scrollbar-gutter: stable;
`
const Container = styled.div`
  height: 100%;
  box-sizing: border-box;
  padding: 15px;
  @media (min-width: 700px) {
    padding: 20px;
  }
  @media (min-width: 1200px) {
    padding: 25px;
  }
  @media (min-width: 1700px) {
    padding: 30px;
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
  /* color: white; */
  background-color: rgba(74, 20, 140, 0.05) !important;
  /* outline: #4a148c 1px solid; */
  font-weight: 700;
  font-size: 1.2em !important;
  text-shadow: 0.5px 0.5px 1px white;
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
  text-shadow: 0.5px 0.5px 1px white;
  /* color: white; */
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
  margin-top: 0;
`
const BottomSpacer = styled.div`
  height: 15px;
  @media (min-width: 700px) {
    height: 20px;
  }
  @media (min-width: 1200px) {
    height: 25px;
  }
  @media (min-width: 1700px) {
    height: 30px;
  }
`

const Home = () => {
  useEffect(() => {
    document.title = 'Erfassen: Home'
  }, [])

  return (
    <ErrorBoundary>
      <OuterContainer>
        <ProgressiveImg src={image} placeholderSrc={placeholderSrc} />
        <ScrollContainer>
          <Container>
            <PageTitle align="center" variant="h6" color="inherit">
              Daten erfassen:
            </PageTitle>
            <CardContainer>
              <Card>
                <CardTitle>Was Sie wollen</CardTitle>
                Text, Pläne, Fotos, Audio, beliebige Dateien.
              </Card>
              <Card>
                <CardTitle>Wie Sie wollen</CardTitle>
                Daten-Strukturen flexibel konfigurieren.
              </Card>
              <Card>
                <CardTitle>Wo Sie wollen</CardTitle>
                <p>Die Interessanten Dinge passieren kaum im Büro.</p>
                <p>Erfassen geht mit Ihnen durch Dick und Dünn.</p>
              </Card>
              <Card>
                <CardTitle>Mit wem Sie wollen</CardTitle>
                <p>Neue Mitarbeitende einfach ergänzen.</p>
                <p>Egal, wie viele.</p>
              </Card>
              <Card>
                <CardTitle>Mit Ihrem Gerät</CardTitle>
                <p>Handy, Tablet, Notebook, PC…</p>
                <p>Windows, MacOS, Android, iOS, Linux…</p>
              </Card>
              <Card>
                <CardTitle>Mit minimalem Aufwand</CardTitle>
                <p>
                  Keine Installation:
                  <br />
                  Anmelden und loslegen.
                </p>
              </Card>
              <Card>
                <CardTitle>Eine für alle, alle für eine</CardTitle>
                <p>Eine Person konfiguriert.</p>
                <p>Die übrigen können direkt erfassen.</p>
              </Card>
              <Card>
                <CardTitle>Alle können gleichzeitig arbeiten</CardTitle>
                <p>Daten werden live synchronisiert.</p>
                <p>Zwei Eingaben widersprechen sich? Kein Problem:</p>
                <p>
                  Konflikte werden angezeigt und können einfach gelöst werden.
                </p>
              </Card>
              <Card>
                <CardTitle>Kein Internet? Egal!</CardTitle>
                <p>Offline-Erfassung ist unsere Stärke!</p>
                <p>
                  Nur Konfiguration, Synchronisation und Konfliktlösung
                  benötigen Internet.
                </p>
              </Card>
              <Card>
                <CardTitle>Faire Preise</CardTitle>
                <p>Wer Projekte konfiguriert zahlt. BenutzerInnen nicht.</p>
                <p>Sie zahlen erst, wenn Sie Erfassen produktiv nutzen.</p>
              </Card>
              <Card>
                <CardTitle>Fragen?</CardTitle>
                <p>Ich helfe Ihnen gerne beim Start.</p>
                <p>
                  Ihr Anwendungsfall interessiert mich und hilft bei der
                  Weiter-Entwicklung.
                </p>
                <p>Kontaktieren Sie mich.</p>
              </Card>
              <Card>
                <CardTitle>Beratung und Mass-Anfertigung</CardTitle>
                <p>
                  Ich helfe Ihnen gerne, für ihre Bedürfnisse die richtige
                  Datenstruktur zu finden.
                </p>
                <p>Oder erfassen.ch für besondere Projekte masszuschneidern.</p>
              </Card>
            </CardContainer>
            <BottomSpacer />
          </Container>
        </ScrollContainer>
      </OuterContainer>
    </ErrorBoundary>
  )
}

export default observer(Home)
