import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import styled from '@emotion/styled'
import Typography from '@mui/material/Typography'
import MaterialCard from '@mui/material/Card'

import ErrorBoundary from '../components/shared/ErrorBoundary'
import constants from '../utils/constants'

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
  }
`
const Card = styled(MaterialCard)`
  padding: 30px;
  color: #2a005d;
  /* background-color: rgba(74, 20, 140, 0.03) !important; */
  background-color: rgba(255, 255, 255, 0.85) !important;
  outline: rgba(74, 20, 140, 0.3) 1px solid;
  font-weight: 700;
  font-size: 1.2em !important;
  /* text-shadow: white 0 0 2px, rgba(74, 20, 140, 0.25) 0 0 5px; */
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
  font-size: 2.5em !important;
  padding-bottom: 15px;
  font-weight: 700 !important;
  text-shadow: white 0 0 5px;
  color: #2a005d;
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
  font-size: 1.5em;
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

const Img = styled.img`
  display: block;
  height: 100%;
  width: 100%;
  object-fit: cover;
  filter: opacity(0.3);
`

const Home = (): React.FC => {
  useEffect(() => {
    document.title = 'Erfassen: Home'
  }, [])

  return (
    <ErrorBoundary>
      <OuterContainer>
        <picture>
          <source
            srcSet="home_500.avif 500w, home_800.avif 800w, home_1200.avif 1200w, home_2000.avif 2000w, home_2501.avif 2500w"
            type="image/avif"
          />
          <Img
            src="home_500.webp"
            srcSet="home_500.webp 500w, home_800.webp 800w, home_1200.webp 1200w, home_2000.webp 2000w, home_2501.webp 2500w"
            sizes="100vw"
          />
        </picture>
        <ScrollContainer>
          <Container>
            <PageTitle align="center" variant="h6" color="inherit">
              Daten erfassen:
            </PageTitle>
            <CardContainer>
              <Card>
                <CardTitle>Was du willst</CardTitle>
                Text, Pläne, Fotos, Audio, beliebige Dateien.
              </Card>
              <Card>
                <CardTitle>Wie du willst</CardTitle>
                Daten-Strukturen flexibel konfigurieren.
              </Card>
              <Card>
                <CardTitle>Wo du willst</CardTitle>
                <p>Die interessanten Dinge passieren selten im Büro.</p>
                <p>Erfassen geht mit dir durch Dick und Dünn.</p>
              </Card>
              <Card>
                <CardTitle>Mit wem du willst</CardTitle>
                <p>Mitarbeitende einfach ergänzen.</p>
                <p>Egal wie viele.</p>
              </Card>
              <Card>
                <CardTitle>Mit deinen Geräten</CardTitle>
                <p>Handy, Tablet, Notebook, PC…</p>
                <p>Windows, MacOS, Android, iOS, Linux…</p>
                <p>Egal was. Egal wie viele.</p>
              </Card>
              <Card>
                <CardTitle>Mit minimalem Aufwand</CardTitle>
                <p>Keine Installation.</p>
                <p>Anmelden und loslegen.</p>
              </Card>
              <Card>
                <CardTitle>Eine für alle, alle für eine...</CardTitle>
                <p>Eine Person konfiguriert.</p>
                <p>Die übrigen können direkt erfassen.</p>
              </Card>
              <Card>
                <CardTitle>...alle zusammen</CardTitle>
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
                <p>Es zahlt, wer Projekte konfiguriert.</p>
                <p>Erst, wenn du Erfassen produktiv nutzt!</p>
                <p>Mitarbeitende zahlen nicht.</p>
              </Card>
              <Card>
                <CardTitle>Fragen?</CardTitle>
                <p>Ich helfe gerne beim Start.</p>
                <p>
                  Dein Anwendungsfall interessiert mich und hilft bei der
                  Weiterentwicklung.
                </p>
                <p>Kontaktiere mich.</p>
              </Card>
              <Card>
                <CardTitle>Beratung, Anpassung</CardTitle>
                <p>
                  Gerne helfe ich, für deine Bedürfnisse die optimale
                  Datenstruktur zu finden.
                </p>
                <p>Oder klone und optimiere Erfassen für dich.</p>
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
