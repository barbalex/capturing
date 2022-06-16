import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { Container } from './ImageLayerTypes'

const DataSynchronisation = () => {
  return (
    <Container>
      <h1>Data Synchronisation</h1>

      <p>
        Synchronisation will be used in the following sense: The act of making
        data available locally i.e. offline.
      </p>

      <h3>1. Goal</h3>
      <ul>
        <li>Every user</li>
        <li>has access to all the data</li>
        <li>he/she may access</li>
        <li>on every device</li>
        <li>irrelevant of internet availability</li>
        <li>with minimal fuss.</li>
      </ul>
      <p></p>

      <h3>2. What is synchronized</h3>
      <ul>
        <li>
          User data: All data input by users, owned by the account owner. Can be
          divided into:
        </li>
        <ul>
          <li>
            {
              "Configuration data: Project(s), tables and fields. Managed by the project's manager(s)"
            }
          </li>
          <li>
            Core user data: table rows and their files. The actual data captured
          </li>
        </ul>
        <li>Vector maps</li>
        <li>WMTS maps</li>
        <li>WMS maps</li>
      </ul>

      <h3>3. When things are synchronized</h3>
      <ul>
        <li>
          {
            'Core user data is constantly synced both ways (app <> server) while the app is active and internet is available.'
          }
          <br />
          {
            "This enables concurrent data capturing by multiple users while keeping data conflicts at a minimum as every user immediately sees other user's inputs"
          }
        </li>
        <li>
          Configuration data is synced both ways on every app start.
          <br />
          This includes metadata (configuration) for vector, WMTS and WMS maps
        </li>
        <li>
          Vector data: If it was uploaded to erfassen.app, it is directly
          downloaded.
          <br />
          If it originates from a wfs service, the app fetches it from the wfs
          service (if necessary)
        </li>
        <li>
          WMTS image data: TODO: Image data is (not) automatically fetched from
          the wmts service?
        </li>
        <li>WMS maps are only available online</li>
      </ul>

      <h3>4. How things are synchronized</h3>
      <p>This is becoming more technical. You have been warned 😉</p>
      <ul>
        <li>
          Configuration data is simply downloaded, overwriting the local
          version, if the server-side version is newer than the local version:
          <ul>
            <li>Configuration data</li>
            <li>Uploaded vector data</li>
          </ul>
        </li>
        <li>
          Data originating from web services is fetched from those services:
        </li>
        <ul>
          <li>WFS vector data</li>
          <li>TODO: WMTS image data in areas marked for download?</li>
        </ul>
      </ul>
    </Container>
  )
}

export default DataSynchronisation
