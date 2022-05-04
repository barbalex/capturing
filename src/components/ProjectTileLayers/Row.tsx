import { useCallback } from 'react'
import styled from 'styled-components'
import Checkbox from '@mui/material/Checkbox'
import { useNavigate } from 'react-router-dom'
import { Session } from '@supabase/supabase-js'

import constants from '../../utils/constants'
import { dexie, ProjectTileLayer } from '../../dexieClient'
import { supabase } from '../../supabaseClient'

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
type Props = {
  row: ProjectTileLayer
}

const ProjectTilelayerComponent = ({ row }: Props) => {
  const navigate = useNavigate()
  const session: Session = supabase.auth.session()

  const onClickActive = useCallback(
    async (e) => {
      e.preventDefault()
      e.stopPropagation()
      const was = { ...row }
      const active = row.active === 1 ? 0 : 1
      await dexie.project_tile_layers.update(row.id, {
        active,
      })

      row.updateOnServer({
        was,
        is: { ...was, active },
        session,
      })
    },
    [row, session],
  )

  const onClickRow = useCallback(() => navigate(row.id), [navigate, row.id])

  return (
    <Container onClick={onClickRow}>
      <RowLink>{row.label}</RowLink>
      <Checkbox
        checked={row.active === 1}
        onClick={onClickActive}
        title={row.active ? 'ausblenden' : 'einblenden'}
      />
    </Container>
  )
}

export default ProjectTilelayerComponent
