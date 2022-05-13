import React, { useEffect, useState, useCallback } from 'react'
import axios from 'redaxios'
import styled from 'styled-components'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'
import { motion, useAnimation } from 'framer-motion'

import ErrorBoundary from '../../shared/ErrorBoundary'
import Label from '../../shared/Label'
import { Row } from '../../../dexieClient'
import Spinner from '../../shared/Spinner'
import constants from '../../../utils/constants'

const Container = styled.div`
  margin: 15px -10px 10px -10px;
`
const TitleRow = styled.div`
  background-color: rgba(248, 243, 254, 1);
  flex-shrink: 0;
  display: flex;
  height: ${constants.titleRowHeight}px;
  justify-content: space-between;
  padding: 0 10px;
  cursor: pointer;
  user-select: none;
  position: sticky;
  top: -10px;
  z-index: 1;
  &:first-of-type {
    margin-top: -10px;
  }
`
const Title = styled.div`
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
`
const LegendsContainer = styled.div`
  padding: 10px;
`

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
          if (objectUrl) legends.push([layer, objectUrl])
        }

        setLegends(legends)
      }
      run()
    }
  }, [row])
  const [open, setOpen] = useState(false)
  const anim = useAnimation()
  const onClickToggle = useCallback(
    async (e) => {
      e.stopPropagation()
      if (open) {
        const was = open
        await anim.start({ opacity: 0 })
        await anim.start({ height: 0 })
        setOpen(!was)
      } else {
        setOpen(!open)
        setTimeout(async () => {
          await anim.start({ height: 'auto' })
          await anim.start({ opacity: 1 })
        })
      }
    },
    [anim, open],
  )

  if (!row) return <Spinner />

  return (
    <ErrorBoundary>
      <Container>
        <TitleRow
          onClick={onClickToggle}
          title={open ? 'schliessen' : 'öffnen'}
        >
          <Title>Legenden</Title>
          <div>
            <IconButton
              aria-label={open ? 'schliessen' : 'öffnen'}
              title={open ? 'schliessen' : 'öffnen'}
              onClick={onClickToggle}
              size="large"
            >
              {open ? <FaChevronUp /> : <FaChevronDown />}
            </IconButton>
          </div>
        </TitleRow>
        <motion.div animate={anim} transition={{ type: 'just', duration: 0.2 }}>
          <LegendsContainer>
            {(legends ?? []).map((l) => {
              const title = l[0]
              const blob = l[1]

              return (
                <div key={title}>
                  <Label label={title} />
                  {!!blob && <img src={blob} />}
                </div>
              )
            })}
          </LegendsContainer>
        </motion.div>
      </Container>
    </ErrorBoundary>
  )
}

export default ProjectTileLayerFormLegends
