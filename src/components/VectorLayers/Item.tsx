import { useCallback, useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import Checkbox from '@mui/material/Checkbox'
import { useNavigate } from 'react-router-dom'

import constants from '../../utils/constants'
import { dexie, VectorLayer } from '../../dexieClient'
import storeContext from '../../storeContext'

// TODO: alter css on isdragging
const Container = styled.div`
  height: ${constants.singleRowHeight}px;
  border-top: thin solid rgba(74, 20, 140, 0.1);
  border-bottom: ${(props) => (props['data-last'] ? '1px' : 'thin')} solid
    rgba(74, 20, 140, 0.1);
  border-collapse: collapse;
  margin: -1px 0;
  padding: 0 15px 0 0;
  display: flex;
  align-items: center;
  cursor: pointer;
  ${(props) =>
    props.isdragging === 'true' &&
    `
    /*background: rgba(230, 81, 0, 0.1);*/
    background: rgba(74, 20, 140, 0.1);
    border-color: #E65100;
    box-shadow: 0px 0px 2px rgba(74, 20, 140, 1), 0px 0px 10px rgba(74, 20, 140, 1);
  `}
  &:hover {
    background-color: rgba(74, 20, 140, 0.03);
  }
`
const RowLink = styled.div`
  width: calc(100% - 50px);
  height: ${constants.singleRowHeight}px;
  padding: 0 0 0 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`
interface Props {
  item: VectorLayer
  provided: DraggableProvided
  isDragging: boolean
}

const VectorLayerItem = ({ item, provided, isDragging }: Props) => {
  const navigate = useNavigate()
  const { session } = useContext(storeContext)

  const onClickActive = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const was = { ...item }
      const active = item.active === 1 ? 0 : 1
      await dexie.vector_layers.update(item.id, {
        active,
      })

      item.updateOnServer({
        was,
        is: { ...was, active },
        session,
      })
    },
    [item, session],
  )

  const onClickRow = useCallback(() => navigate(item.id), [navigate, item.id])

  return (
    <Container
      onClick={onClickRow}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
      style={provided.draggableProps.style}
      isdragging={isDragging?.toString()}
    >
      <RowLink>{item.label}</RowLink>
      <Checkbox
        checked={item.active === 1}
        onClick={onClickActive}
        title={item.active ? 'ausblenden' : 'einblenden'}
      />
    </Container>
  )
}

export default observer(VectorLayerItem)
