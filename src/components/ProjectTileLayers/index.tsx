import React, { useContext, useEffect, useState, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { Virtuoso } from 'react-virtuoso'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'
import { Session } from '@supabase/supabase-js'

import storeContext from '../../storeContext'
import Item from './Item'
import ErrorBoundary from '../shared/ErrorBoundary'
import { dexie, ProjectTileLayer } from '../../dexieClient'
import { supabase } from '../../supabaseClient'
import Title from './Title'
import HeightPreservingItem from '../shared/HeightPreservingItem'

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

const ProjectTileLayersComponent = () => {
  const session: Session = supabase.auth.session()
  const { projectId } = useParams()

  const store = useContext(storeContext)
  const { formHeight, setTileLayerSorter, rebuildTree } = store

  const projectTileLayers: ProjectTileLayer[] = useLiveQuery(
    async () =>
      await dexie.project_tile_layers
        .where({ deleted: 0, project_id: projectId })
        .sortBy('sort'),
    [projectId],
  )

  const [items, setItems] = useState<ProjectTileLayer[]>([])
  useEffect(() => {
    if (!projectTileLayers) return
    setItems(projectTileLayers)
  }, [projectTileLayers])

  const reorder = useCallback(
    async (list, startIndex, endIndex) => {
      const result = Array.from(list)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)

      /**
       * set sort value according to index in list
       * if it has changed
       */
      const projectTileLayersToUpdate = []
      for (const [index, res] of result.entries()) {
        const sort = index + 1
        const projectTileLayer = projectTileLayers.find(
          (ptl) => ptl.id === res.id,
        )
        if (projectTileLayer.sort !== sort) {
          // update sort value
          const was = { ...projectTileLayer }
          const is = { ...projectTileLayer, sort }
          projectTileLayersToUpdate.push(is)
          projectTileLayer.updateOnServer({
            was,
            is,
            session,
          })
        }
      }
      // push in bulk to reduce re-renders via liveQuery
      await dexie.project_tile_layers.bulkPut(projectTileLayersToUpdate)
      setTileLayerSorter(
        projectTileLayers.map((e) => `${e.sort}-${e.id}`).join('/'),
      )
      rebuildTree()

      return result
    },
    [projectTileLayers, rebuildTree, session, setTileLayerSorter],
  )

  const onDragEnd = useCallback(
    (result) => {
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
              <Droppable
                droppableId="droppable"
                mode="virtual"
                renderClone={(provided, snapshot, rubric) => (
                  <Item
                    provided={provided}
                    isDragging={snapshot.isDragging}
                    item={items[rubric.source.index]}
                  />
                )}
              >
                {(provided) => (
                  <Virtuoso
                    components={{
                      Item: HeightPreservingItem,
                    }}
                    scrollerRef={provided.innerRef}
                    data={items}
                    height={formHeight}
                    totalCount={items.length}
                    itemContent={(index, item) => {
                      return (
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
                      )
                    }}
                  />
                )}
              </Droppable>
            </DragDropContext>
          )}
        </RowsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(ProjectTileLayersComponent)
