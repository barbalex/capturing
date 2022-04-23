import React, { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'

import { dexie, Project } from '../../dexieClient'
import buildTree from './build'

const Tree = React.forwardRef((props, ref) => {
  const { projectId, tableId, rowId, fieldId } = useParams()

  const [data, setData] = useState()
  useEffect(() => {
    buildTree((data) => setData(data))
  }, [projectId, tableId, rowId, fieldId])

  console.log('Tree, data:', data)

  return <div ref={ref}>tree</div>
})

export default Tree
