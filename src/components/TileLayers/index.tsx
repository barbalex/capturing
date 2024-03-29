import React, { useContext, useEffect, useState, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import storeContext from '../../storeContext'
import Item from './Item'
import ErrorBoundary from '../shared/ErrorBoundary'
import { dexie, TileLayer } from '../../dexieClient'
import Title from './Title'
import { IStore } from '../../store'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};

  .height-preserving-container:empty {
    min-height: calc(var(--child-height));
    box-sizing: border-box;
  }
`
const RowsContainer = styled.div`
  height: 100%;
  overflow: auto;
`

// Virtuoso's resize observer can this error,
// which is caught by DnD and aborts dragging.
window.addEventListener('error', (e) => {
  if (
    e.message ===
      'ResizeObserver loop completed with undelivered notifications.' ||
    e.message === 'ResizeObserver loop limit exceeded'
  ) {
    e.stopImmediatePropagation()
  }
})

const TileLayersComponent = () => {
  const { projectId } = useParams()

  const store: IStore = useContext(storeContext)
  const { setTileLayerSorter, rebuildTree, session } = store

  const tileLayers: TileLayer[] | undefined = useLiveQuery(
    async () =>
      await dexie.tile_layers
        .where({ deleted: 0, project_id: projectId })
        .sortBy('sort'),
    [projectId],
  )

  const [items, setItems] = useState<TileLayer[]>([])
  useEffect(() => {
    if (!tileLayers) return
    setItems(tileLayers)
  }, [tileLayers])

  const reorder = useCallback(
    async (list: TileLayer[], startIndex: number, endIndex: number) => {
      const result = Array.from(list)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)

      /**
       * set sort value according to index in list
       * if it has changed
       */
      const tileLayersToUpdate = []
      for (const [index, res] of result.entries()) {
        const sort = index + 1
        const tileLayer = tileLayers.find((tl) => tl.id === res.id)
        if (tileLayer.sort !== sort) {
          // update sort value
          const was = { ...tileLayer }
          const is = { ...tileLayer, sort }
          tileLayersToUpdate.push(is)
          tileLayer.updateOnServer({
            was,
            is,
            session,
          })
        }
      }
      // push in bulk to reduce re-renders via liveQuery
      await dexie.tile_layers.bulkPut(tileLayersToUpdate)
      setTileLayerSorter(tileLayers.map((e) => `${e.sort}-${e.id}`).join('/'))
      rebuildTree()

      return result
    },
    [tileLayers, rebuildTree, session, setTileLayerSorter],
  )

  const onDragEnd = useCallback(
    (result: OnDragEndResponder) => {
      if (!result.destination) {
        return
      }
      if (result.source.index === result.destination.index) {
        return
      }

      setItems((items) =>
        reorder(items, result.source.index, result.destination.index),
      )
    },
    [reorder],
  )

  // Virtuoso creates css error when items.length is 0
  // so need to only render when items.length is not
  return (
    <ErrorBoundary>
      <Container showfilter={false}>
        <Title />
        <RowsContainer>
          {!!items.length && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {items.map((item, index) => (
                      <Draggable
                        draggableId={item.id}
                        index={index}
                        key={item.id}
                      >
                        {(provided) => (
                          <Item
                            provided={provided}
                            item={item}
                            isDragging={false}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </RowsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(TileLayersComponent)
