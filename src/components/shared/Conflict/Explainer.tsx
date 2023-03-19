import React from 'react'
import styled from '@emotion/styled'

const ExplainText = styled.div`
  margin-bottom: 10px;
  li {
    margin-bottom: 0;
  }
`
const OptionalHelp = styled.details`
  margin-bottom: 10px;
`
const Summary = styled.summary`
  user-select: none;
  padding-bottom: 5px;
  font-weight: 500;
  &:focus {
    outline: none !important;
  }
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`
const Details = styled.div`
  padding-left: 17px;
  font-size: 0.8rem;
  padding-bottom: 10px;
`
const Ul = styled.ul`
  margin-top: 4px;
  margin-bottom: 0;
  padding-left: 13px;
`

const ConflictExplainer: React.FC = () => (
  <OptionalHelp>
    <Summary>Infos und Anleitung</Summary>
    <Details>
      <ExplainText>
        {`Es gibt einen Konflikt zwischen der aktuellen Version
            und der unten angezeigten widersprüchlichen.`}
      </ExplainText>
      <ExplainText>
        Konflikte können entstehen, wenn:
        <Ul>
          <li>
            zwei Personen
            <br /> oder eine Person an verschiedenen Geräten
          </li>
          <li>
            gleichzeitig <br />
            oder während mindestens eine der Personen offline ist
          </li>
        </Ul>
        {`...am selben Datensatz arbeiten.`}
      </ExplainText>
      <ExplainText>
        {`erfassen.app hat den Konflikt erkannt und automatisch eine Version
            zum Gewinner erklärt. Das ist die "aktuelle" Version.`}
      </ExplainText>
      <ExplainText>
        erfassen.app weiss aber nicht, ob die aktuelle Version auch korrekt ist.
        Darum müssen Sie den Konflikt bereinigen:
      </ExplainText>
      <Ul>
        <li>
          Passen Sie die aktuelle Version wenn nötig an und verwerfen Sie
          anschliessend die widersprüchliche
        </li>
        <li>Oder: Übernehmen Sie die widersprüchliche Version</li>
      </Ul>
    </Details>
  </OptionalHelp>
)

export default ConflictExplainer
