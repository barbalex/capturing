import { Link } from 'react-router-dom'

import { Container } from './ImageLayerTypes'

const OfflineMaps = () => {
  return (
    <Container>
      <h1>Offline Maps</h1>

      <p>
        Offline mapping capabilities of erfassen.app depend on the following map
        and data types.
      </p>
      <p>
        Also relevant:{' '}
        <Link to="/docs/data-synchronisation">how data is synchronized</Link>.
      </p>

      <h3>1. Data captured in erfassen.app</h3>

      <p>
        Data (geographical or not) you captured on a certain device remains
        locally available.
      </p>
      <p>
        Data captured by someone else, or you on a different device, is synced
        to your device automatically and immediately, whenever the app is active
        and internet available.
      </p>
      <p>
        You can always capture new data (geographical or not), irrespective of
        internet availability.
      </p>
      <p>
        You may wish to display some of the following types of maps to help you
        with capturing geographic data, though:
      </p>

      <h3>2. Vector maps</h3>

      <p>
        Similar to data captured in erfassen.app, vector maps are always
        downloaded to your device and thus locally available.
      </p>

      <h3>3. WMTS maps (Web Map Tiling Service)</h3>
      <p>
        WMTS maps are image based. Images can be huge. Multiple images are
        needed for the same area, to account for different zoom levels.
      </p>
      <p>
        Also: WMTS servers will usually fail when requested to deliver very
        large amounts of data. Their failure-threshold can vary, making
        automated pre-downloading hard.
      </p>
      <p>
        Thus, unlike vector maps, image maps are not automatically downloaded to
        your device.
      </p>
      <p>
        Instead, you can explicitly choose areas to be downloaded (in the image
        maps form) before going offline.
      </p>

      <h3>4. WMS maps (Web Map Service)</h3>

      <p>
        WMS servers do not provide tiles. Instead, they provide a single image
        tailored for the exact extent and zoom level currently used in your map.
      </p>
      <p>This makes pre-downloading for offline usage much harder.</p>
      <p>
        Currently WMS maps can not be used offline in erfassen.app. Please tell
        us if you need this feature and why.
      </p>
    </Container>
  )
}

export default OfflineMaps
