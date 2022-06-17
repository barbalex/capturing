import { Link } from 'react-router-dom'

import { Container } from './ImageLayerTypes'

const DataHistory = () => {
  return (
    <Container>
      <h1>Daten-Historie</h1>

      <p>
        Die Historisierung zeigt alle bisherigen Versionen eines Datensatzes an.
        Und sie ermöglicht, jeden dieser Zustände wieder herzustellen.
      </p>
      <p>
        Um offline fähig zu sein (
        <Link to="/docs/data-versioning">mehr dazu</Link>) erstellt
        erfassung.app bei jeder Änderung eines Datensatzes eine neue Version.
        Somit existiert eine vollständige Historisierung aller Datensätze.
      </p>
      <p>Historische Versionen sind nur online verfügbar.</p>
      <p>
        Um die Historie eines Datensatzes zu sehen, klickt man auf das
        entsprechende Symbol:
        <br />
        TODO: add image
      </p>
      <ul>
        <li>
          In der Mobil-Ansicht gibt es statt des Symbols einen Menü-Eintrag
        </li>
        <li>Offline ist das Symbol inaktiv</li>
      </ul>
      <p>
        Nun öffnet sich rechts der aktuellen Version eine neue Spalte. Sie
        stellt alle verfügbaren Versionen in einem &#34;Karussell&#34; dar:
        <br />
        TODO: add image
      </p>
      <ul>
        <li>Die letzte Version ist im Karussell sichtbar</li>
        <li>
          Unterschiede zur aktuellen Version werden farblich hervorgehoben (die
          &#34;nicht vergleichen&#34;-Schaltfläche schaltet diese Funktion aus)
        </li>
        <li>
          Mit den Pfeil-Symbolen, Pfeil-Tasten auf der Tastatur (wenn es
          fokussiert ist - wenn nötig irgendwo ins Formular klicken) oder
          Wischgesten kann man sich nun Version um Version durch die Historie
          bewegen
        </li>
        <li>
          Die Punkte zuunterst stellen je eine Version dar. Durch Klick auf
          einen Punkt navigiert man zur entsprechenden Version
        </li>
        <li>
          Klickt man auf die &#34;wiederherstellen&#34;-Schaltfläche, wird die
          aktuelle Version durch die historische ersetzt
        </li>
      </ul>
    </Container>
  )
}

export default DataHistory
