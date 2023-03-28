import { Link } from 'react-router-dom'

import { Container } from './ImageLayerTypes'

const DataSynchronisation = () => {
  return (
    <Container>
      <h1>Data Synchronisation</h1>
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
            Configuration data: Project(s), tables, fields and maps
            configuration. Managed by the project&apos;s manager(s)
          </li>
          <li>
            Core user data: table rows and related files. The actual data
            captured by most collaborators
          </li>
        </ul>
        <li>Vector maps</li>
        <li>WMTS maps</li>
        <li>WMS maps</li>
      </ul>

      <h3>3. When things are synchronized</h3>
      <ul>
        <li>
          Core user data is constantly synced two ways (app &lt;&gt; server)
          while the app is active and internet is available.
          <br />
          This enables concurrent data capturing by multiple users while keeping
          data conflicts at a minimum as every user immediately sees other
          user&apos;s inputs
        </li>
        <li>
          Configuration data is synced two ways on app start.
          <br />
          This includes configuration for vector, WMTS and WMS maps
        </li>
        <li>
          Vector data: If it was uploaded to erfassen.app, it is directly
          downloaded.
          <br />
          If it originates from a WFS service, the app fetches it from the WFS
          service (if necessary)
        </li>
        <li>
          WMTS image data: TODO: Image data is (not) automatically fetched from
          the WMTS service?
        </li>
        <li>
          WMS maps are (currently){' '}
          <Link to="/docs/offline-maps">only available online</Link>
        </li>
      </ul>

      <h3>4. How things are synchronized</h3>
      <ul>
        <li>
          Data managed by the project&apos;s manager(s) is simply downloaded,
          overwriting the local version, if the server-side version is newer
          than the local version:
          <ul>
            <li>Configuration data</li>
            <li>Uploaded vector data</li>
          </ul>
        </li>
        <li>Data originating from web services is fetched from those:</li>
        <ul>
          <li>WFS vector data</li>
          <li>TODO: WMTS image data in areas marked for download?</li>
        </ul>
        <li>
          Core user data <Link to="/docs/data-versioning">is versioned</Link> to
          enable dealing with conflicts
        </li>
      </ul>

      <h3>5. Edits are queued</h3>
      <p>
        Edits are sent into a queue. When online they are immediately sent to
        the server. When offline they are persisted and sent to the server, as
        soon as internet is available.
      </p>
    </Container>
  )
}

export default DataSynchronisation
