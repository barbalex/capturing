import { useEffect, useRef } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import * as ReactDOMServer from 'react-dom/server'

import WMSPopup from '../TileLayers/TileLayer/Popup'

/**
 * ref is to ensure layer is updated when data changes
 * https://github.com/PaulLeCam/react-leaflet/issues/332#issuecomment-731379795
 */
const TableLayer = ({ data, style, table }) => {
  const map = useMap()
  const mapSize = map.getSize()

  const ref = useRef()
  useEffect(() => {
    if (ref.current) {
      ref.current.clearLayers().addData(data)
    }
  }, [data])

  if (!data) return []

  return (
    <GeoJSON
      data={data}
      style={style}
      ref={ref}
      onEachFeature={(feature, _layer) => {
        const layersData = [
          {
            label: table.name,
            properties: Object.entries(feature?.properties).filter(
              ([key]) => key !== 'style',
            ),
          },
        ]
        const popupContent = ReactDOMServer.renderToString(
          <WMSPopup layersData={layersData} mapHeight={mapSize.y} />,
        )
        _layer.bindPopup(popupContent)
      }}
    />
  )
}

export default TableLayer
