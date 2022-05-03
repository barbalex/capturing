import React, {
  useContext,
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import isEqual from 'lodash/isEqual'
import { Session } from '@supabase/supabase-js'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion, useAnimation } from 'framer-motion'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
import IconButton from '@mui/material/IconButton'

// TODO: check references
import StoreContext from '../storeContext'
import Checkbox2States from './shared/Checkbox2States'
import ErrorBoundary from './shared/ErrorBoundary'
import ColorPicker from './shared/ColorPicker'
import { dexie, LayerStyle } from '../dexieClient'
import { supabase } from '../supabaseClient'
import TextField from './shared/TextField'
import constants from '../utils/constants'
import insertLayerStyle from '../utils/insertLayerStyle'

const Container = styled.div`
  margin: 25px -10px 10px -10px;
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
  top: 0;
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
const FieldsContainer = styled.div`
  padding: 10px;
`

const LayerStyleForm = () => {
  const session: Session = supabase.auth.session()
  const { projectTileLayerId, tableId } = useParams()
  const store = useContext(StoreContext)
  const { errors } = store

  // console.log('ProjectForm rendering')

  const unsetError = useCallback(
    () => () => {
      console.log('TODO: unsetError')
    },
    [],
  ) // TODO: add errors, unsetError in store
  useEffect(() => {
    unsetError('project')
  }, [projectTileLayerId, tableId, unsetError])

  const criteria = tableId
    ? { table_id: tableId }
    : projectTileLayerId
    ? { project_tile_layer_id: projectTileLayerId }
    : 'none'
  const row: Row = useLiveQuery(
    async () => await dexie.layer_styles.get(criteria),
    [projectTileLayerId, tableId],
  )

  console.log('LayerStyleForm', { row, criteria, tableId, projectTileLayerId })

  const originalRow = useRef<LayerStyle>()
  const rowState = useRef<LayerStyle>()
  useEffect(() => {
    rowState.current = row
    if (!originalRow.current && row) {
      originalRow.current = row
    }
  }, [row])

  const updateOnServer = useCallback(async () => {
    // only update if is changed
    if (isEqual(originalRow.current, rowState.current)) return

    row.updateOnServer({
      was: originalRow.current,
      is: rowState.current,
      session,
    })
    // ensure originalRow is reset too
    originalRow.current = rowState.current
  }, [row, session])

  useEffect(() => {
    window.onbeforeunload = async () => {
      // save any data changed before closing tab or browser
      updateOnServer()
    }
  }, [updateOnServer])

  const onBlur = useCallback(
    async (event) => {
      const { name: field, value, type, valueAsNumber } = event.target
      let newValue = type === 'number' ? valueAsNumber : value
      if ([undefined, '', NaN].includes(newValue)) newValue = null

      // only update if value has changed
      const previousValue = rowState.current[field]
      if (newValue === previousValue) return

      // update rowState
      rowState.current = { ...row, ...{ [field]: newValue } }
      // update dexie
      dexie.layer_styles.update(row.id, { [field]: newValue })
    },
    [row],
  )

  const [open, setOpen] = useState(false)
  const anim = useAnimation()
  const onClickToggle = useCallback(
    async (e) => {
      e.stopPropagation()
      if (!row) {
        await insertLayerStyle({ tableId, projectTileLayerId })
      }
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
    [anim, open, projectTileLayerId, row, tableId],
  )

  const showDeleted = false

  return (
    <ErrorBoundary>
      <Container>
        <TitleRow
          onClick={onClickToggle}
          title={open ? 'schliessen' : 'öffnen'}
        >
          <Title>{`Styling von Geometrien`}</Title>
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
          {open && !!row && (
            <FieldsContainer
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  // focus left the container
                  // https://github.com/facebook/react/issues/6410#issuecomment-671915381
                  updateOnServer()
                }
              }}
            >
              {showDeleted && (
                <Checkbox2States
                  label="gelöscht"
                  name="deleted"
                  value={row.deleted}
                  onBlur={onBlur}
                  error={errors?.project?.deleted}
                />
              )}
              <TextField
                name="icon_url"
                label="URL für Punkt-Icon"
                value={row.icon_url}
                onBlur={onBlur}
                error={errors?.project?.icon_url}
              />
              <TextField
                name="icon_retina_url"
                label="URL für Punkt-Icon, hochauflösend"
                value={row.icon_retina_url}
                onBlur={onBlur}
                error={errors?.project?.icon_retina_url}
              />
              <TextField
                name="icon_size"
                label="Icon Grösse (in Bild-Punkten)"
                value={row.icon_size}
                onBlur={onBlur}
                error={errors?.project?.icon_size}
                type="number"
              />
              <TextField
                name="stroke"
                label="Linien-Breite (in Bild-Punkten)"
                value={row.stroke}
                onBlur={onBlur}
                error={errors?.project?.stroke}
                type="number"
              />
              <TextField
                name="color"
                label="Linien-Farbe"
                value={row.color}
                onBlur={onBlur}
                error={errors?.project?.color}
              />
              <ColorPicker label="Farbe" onBlur={onBlur} color={row.color} />
            </FieldsContainer>
          )}
        </motion.div>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(LayerStyleForm)
