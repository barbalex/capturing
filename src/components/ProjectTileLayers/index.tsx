import React, { useContext, useEffect, useState, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { Virtuoso } from 'react-virtuoso'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import storeContext from '../../storeContext'
import Item from './Item'
import ErrorBoundary from '../shared/ErrorBoundary'
import { dexie, ProjectTileLayer } from '../../dexieClient'
import Title from './Title'

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

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  /**
   * TODO:
   * set sort value according to index in list?
   */

  return result
}

const ProjectTileLayersComponent = () => {
  const { projectId } = useParams()

  const store = useContext(storeContext)
  const { formHeight } = store

  const projectTileLayers: ProjectTileLayer[] = useLiveQuery(
    async () =>
      await dexie.project_tile_layers
        .where({ deleted: 0, project_id: projectId })
        .sortBy('label'),
    [projectId],
  )

  const [items, setItems] = useState<ProjectTileLayer[]>([])
  useEffect(() => {
    if (!projectTileLayers) return
    setItems(projectTileLayers)
  }, [projectTileLayers])

  const onDragEnd = useCallback(
    (result) => {
      if (!result.destination) {
        return
      }
      if (result.source.index === result.destination.index) {
        return
      }

      // void setItems
      setItems((items) =>
        reorder(items, result.source.index, result.destination.index),
      )
    },
    [setItems],
  )

  const HeightPreservingItem = React.useCallback(({ children, ...props }) => {
    const [size, setSize] = useState(0)
    const knownSize = props['data-known-size']
    useEffect(() => {
      setSize((prevSize) => {
        return knownSize == 0 ? prevSize : knownSize
      })
    }, [knownSize])
    // check style.css for the height-preserving-container rule
    return (
      <div
        {...props}
        className="height-preserving-container"
        style={{
          '--child-height': `${size}px`,
        }}
      >
        {children}
      </div>
    )
  }, [])

  return (
    <ErrorBoundary>
      <Container showfilter={false}>
        <Title />
        <RowsContainer>
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
        </RowsContainer>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(ProjectTileLayersComponent)
