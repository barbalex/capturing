import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { MdExpandMore, MdExpandLess } from 'react-icons/md'
import { observer } from 'mobx-react-lite'
import { motion, useAnimation } from 'framer-motion'

import Legends from './Legends'

const ExpandMoreIcon = styled(MdExpandMore)`
  font-size: 1.5rem;
`
const ExpandLessIcon = styled(MdExpandLess)`
  font-size: 1.5rem;
`
const CardContainer = styled.div`
  background-color: white;
  background-clip: padding-box;
  border-radius: 5px;
  outline: 2px solid rgba(0, 0, 0, 0.2);
`
const Card = styled.div`
  padding-top: 3px;
  color: rgb(48, 48, 48);
`
const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding-left: 7px;
  padding-right: 2px;
  ${(props) => props.open && `border-bottom: 1px solid rgba(0, 0, 0, 0.2);`}
  cursor: pointer;
  font-weight: bold;
  user-select: none;
  height: 21px;
`
const CardTitle = styled.div`
  padding-right: 5px;
`
const CardTitleApfloraOpen = styled(CardTitle)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 70px;
`
const StyledExpandLessIcon = styled(ExpandLessIcon)`
  height: 18px !important;
`
const StyledExpandMoreIcon = styled(ExpandMoreIcon)`
  height: 18px !important;
`

const LayersControl = () => {
  // const store = useContext(storeContext)

  const anim = useAnimation()
  const [legendsExpanded, setLegendsExpanded] = useState(false)

  const onToggleApfloraLayersExpanded = useCallback(async () => {
    if (legendsExpanded) {
      await anim.start({ opacity: 0 })
      await anim.start({ height: 0 })
      await anim.start({ width: 108 })
      setLegendsExpanded(false)
    } else {
      setLegendsExpanded(true)
      setTimeout(async () => {
        await anim.start({ height: 'auto' })
        await anim.start({ width: 'auto' })
        await anim.start({ opacity: 1 })
      })
    }
  }, [anim, legendsExpanded])

  const ApfloraCard = legendsExpanded ? CardTitle : CardTitleApfloraOpen

  return (
    <CardContainer>
      <Card>
        <CardHeader
          onClick={onToggleApfloraLayersExpanded}
          open={legendsExpanded}
        >
          <ApfloraCard>Legenden</ApfloraCard>
          <div>
            {legendsExpanded ? (
              <StyledExpandLessIcon />
            ) : (
              <StyledExpandMoreIcon />
            )}
          </div>
        </CardHeader>
        <motion.div animate={anim} transition={{ type: 'just', duration: 0.2 }}>
          {legendsExpanded && <Legends />}
        </motion.div>
      </Card>
    </CardContainer>
  )
}

export default observer(LayersControl)
