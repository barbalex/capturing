import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { MdExpandMore, MdExpandLess } from 'react-icons/md'
import { observer } from 'mobx-react-lite'

// import storeContext from '../../storeContext'

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
  border: 2px solid rgba(0, 0, 0, 0.2);
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
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  cursor: pointer;
  font-weight: bold;
  user-select: none;
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

  const [legendsExpanded, setLegendsExpanded] = useState(false)

  const onToggleApfloraLayersExpanded = useCallback(() => {
    setLegendsExpanded(!legendsExpanded)
  }, [legendsExpanded])

  const ApfloraCard = legendsExpanded ? CardTitle : CardTitleApfloraOpen

  return (
    <CardContainer>
      <Card>
        <CardHeader onClick={onToggleApfloraLayersExpanded}>
          <ApfloraCard>Legenden</ApfloraCard>
          <div>
            {legendsExpanded ? (
              <StyledExpandLessIcon />
            ) : (
              <StyledExpandMoreIcon />
            )}
          </div>
        </CardHeader>
      </Card>
    </CardContainer>
  )
}

export default observer(LayersControl)
