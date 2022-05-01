import { useEffect, useRef } from 'react'
import { GeoJSON } from 'react-leaflet'

/**
 * ref is to ensure layer is updated when data changes
 * https://github.com/PaulLeCam/react-leaflet/issues/332#issuecomment-731379795
 */
const TableLayer = ({ data, table }) => {
  const ref = useRef()
  useEffect(() => {
    if (ref.current) {
      ref.current.clearLayers().addData(data)
    }
  }, [data])

  return <GeoJSON key={table.id} data={data} ref={ref} />
}

export default TableLayer
