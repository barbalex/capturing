import { useEffect, useRef } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import * as ReactDOMServer from 'react-dom/server'
import * as icons from 'react-icons/md'

import Popup from '../Popup'
import { LayerStyle, Table } from '../../../dexieClient'

/**
 * ref is to ensure layer is updated when data changes
 * https://github.com/PaulLeCam/react-leaflet/issues/332#issuecomment-731379795
 */
type Props = {
  data: any
  style: any
  table: Table
  layerStyle: LayerStyle
}

const TableLayer = ({ data, style, table, layerStyle }: Props) => {
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
      key={`${table.id}/${layerStyle.marker_symbol}/${layerStyle?.marker_size}/${layerStyle?.color}/${layerStyle?.opacity}`}
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
          <Popup layersData={layersData} mapSize={mapSize} />,
        )
        _layer.bindPopup(popupContent)
      }}
      pointToLayer={(geoJsonPoint, latlng) => {
        // TODO: add font-weight setting
        if (layerStyle.marker_type === 'circle') {
          return L.circleMarker(latlng, {
            ...style,
            radius: layerStyle.circle_marker_radius ?? 8,
          })
        }
        const Component = icons[layerStyle.marker_symbol]
        return L.marker(latlng, {
          icon: new L.divIcon({
            html: ReactDOMServer.renderToString(
              <Component
                style={{
                  color: layerStyle?.color,
                  fontSize: `${layerStyle?.marker_size ?? 16}px`,
                }}
              />,
            ),
          }),
          opacity: layerStyle.opacity,
        })
      }}
    />
  )
}

export default TableLayer
