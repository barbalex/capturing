import { useEffect, useRef } from 'react'
import { GeoJSON } from 'react-leaflet'
import * as ReactDOMServer from 'react-dom/server'

import Popup from '../Popup'

/**
 * ref is to ensure layer is updated when data changes
 * https://github.com/PaulLeCam/react-leaflet/issues/332#issuecomment-731379795
 */
const TableLayer = ({ data, style, table }) => {
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
        const popupContent = ReactDOMServer.renderToString(
          <Popup feature={feature} label={table.name} />,
        )
        _layer.bindPopup(popupContent)
      }}
    />
  )
}

export default TableLayer
