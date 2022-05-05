import React, { useEffect, useState } from 'react'
import axios from 'redaxios'

import ErrorBoundary from '../../shared/ErrorBoundary'
import { Row } from '../../../dexieClient'
import Spinner from '../../shared/Spinner'

type Props = {
  row: Row
}

// = '99999999-9999-9999-9999-999999999999'
const ProjectTileLayerFormLegends = ({ row }: Props) => {
  const [legends, setLegends] = useState()
  useEffect(() => {
    if (row?.type === 'wms') {
      // fetch legend for EACH layer
      // example: https://wms.zh.ch/FnsSVOZHWMS?service=WMS&VERSION=1.3.0&request=GetLegendGraphic&Layer=zonen-schutzverordnungen&format=png&sld_version=1.1.0
      const layers: string[] = row?.wms_layers?.split(',') ?? []

      const run = async () => {
        const legends = []
        for (const layer of layers) {
          const url = `${row?.wms_base_url}?service=WMS&VERSION=${row?.wms_version}&request=GetLegendGraphic&Layer=${layer}&format=image/png&sld_version=1.1.0`
          let res
          try {
            res = await axios.get(url, {
              responseType: 'blob',
            })
          } catch (error) {
            // error can also be caused by timeout
            console.log(`error fetching legend for layer '${layer}':`, error)
            return false
          }
          let objectUrl
          try {
            objectUrl = URL.createObjectURL(
              new Blob([res.data], { type: 'image/png' }),
            )
          } catch (error) {
            return console.log(
              `error creating objectUrl for legend for layer '${layer}'`,
              error,
            )
          }
          console.log({ objectUrl, data: res.data })
          if (objectUrl) legends.push([layer, objectUrl])
        }

        setLegends(legends)
      }
      run()
    }
  }, [row])

  if (!row) return <Spinner />

  return (
    <ErrorBoundary>
      <div>Legenden</div>
      {(legends ?? []).map((l) => {
        const title = l[0]
        const blob = l[1]

        return (
          <div key={title}>
            <div>{title}</div>
            {!!blob && <img src={blob} />}
          </div>
        )
      })}
    </ErrorBoundary>
  )
}

export default ProjectTileLayerFormLegends
