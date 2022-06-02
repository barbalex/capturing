import { useEffect, useRef } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import * as ReactDOMServer from 'react-dom/server'
import { MdFilterCenterFocus } from 'react-icons/md'

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
        // depending on settings in LayerStyle, use circleMarker or marker
        // and choose markers?
        const marker =
          layerStyle.marker_type === 'circle'
            ? L.circleMarker(latlng, {
                ...style,
                radius: layerStyle.circle_marker_radius ?? 8,
              })
            : L.marker(latlng, {
                // icon: new L.Icon.Default(),
                // TODO: choose icon and it's size from setting in layerStyle
                icon: new L.divIcon({
                  html: ReactDOMServer.renderToString(
                    <MdFilterCenterFocus
                      style={{
                        color: layerStyle?.color,
                        fontSize: `${layerStyle?.marker_size ?? 16}px`,
                      }}
                    />,
                  ),
                }),
                opacity: layerStyle.opacity,
              })

        return marker
      }}
    />
  )
}

export default TableLayer
