import React, { useContext, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import IconButton from '@mui/material/IconButton'
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'

import StoreContext from '../../../storeContext'

const ProjectNavButtons = () => {
  const store = useContext(StoreContext)
  const { activeNodeArray, setActiveNodeArray, removeOpenNode } = store

  const onClickUp = useCallback(() => {
    removeOpenNode(activeNodeArray)
    setActiveNodeArray(activeNodeArray.slice(0, -1))
  }, [activeNodeArray, removeOpenNode, setActiveNodeArray])
  const onClickToSammlungen = useCallback(
    () => setActiveNodeArray([...activeNodeArray, 'Sammlungen']),
    [activeNodeArray, setActiveNodeArray],
  )
  const onClickToKulturen = useCallback(
    () => setActiveNodeArray([...activeNodeArray, 'Kulturen']),
    [activeNodeArray, setActiveNodeArray],
  )

  return (
    <>
      <IconButton title="Zur Liste" onClick={onClickUp} size="large">
        <FaArrowUp />
      </IconButton>
      <IconButton
        title="Zu den Sammlungen dieser Projektes"
        onClick={onClickToSammlungen}
        size="large"
      >
        <FaArrowDown />
      </IconButton>
      <IconButton
        title="Zu den Kulturen dieser Projektes"
        onClick={onClickToKulturen}
        size="large"
      >
        <FaArrowDown />
      </IconButton>
    </>
  )
}

export default observer(ProjectNavButtons)
