import React, { useContext, useState, useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import storeContext from '../../storeContext'
import Item from './Item'
import ErrorBoundary from '../shared/ErrorBoundary'
import { dexie, Project, Field } from '../../dexieClient'
import { IStore } from '../../store'
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

const FieldsComponent = () => {
  const { projectId, tableId } = useParams()
  const store: IStore = useContext(storeContext)
  const { setFieldSorter, rebuildTree, session } = store

  // console.log('FieldsList rendering, tableId:', tableId)

  const data = useLiveQuery(async () => {
    const [fields, project]: [Field[], Project] = await Promise.all([
      dexie.fields.where({ deleted: 0, table_id: tableId }).sortBy('sort'),
      dexie.projects.get(projectId),
    ])

    return {
      fields,
      project,
    }
  }, [tableId, projectId, session?.user?.email])

  const project = data?.project
  const fields = data?.fields

  const [items, setItems] = useState<Field[]>([])
  useEffect(() => {
    if (!fields) return
    setItems(fields)
  }, [fields])

  const reorder = useCallback(
    async (list: Field[], startIndex: number, endIndex: number) => {
      const result = Array.from(list)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)

      /**
       * set sort value according to index in list
       * if it has changed
       */
      const fieldsToUpdate = []
      for (const [index, res] of result.entries()) {
        const sort = index + 1
        const field = fields.find((field) => field.id === res.id)
        if (field.sort !== sort) {
          // update sort value
          const was = { ...field }
          const is = { ...field, sort }
          fieldsToUpdate.push(is)
          field.updateOnServer({
            was,
            is,
            session,
          })
        }
      }
      // push in bulk to reduce re-renders via liveQuery
      await dexie.fields.bulkPut(fieldsToUpdate)
      setFieldSorter(fields.map((e) => `${e.sort}-${e.id}`).join('/'))
      rebuildTree()

      return result
    },
    [fields, rebuildTree, session, setFieldSorter],
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
                            project={project}
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

export default observer(FieldsComponent)
