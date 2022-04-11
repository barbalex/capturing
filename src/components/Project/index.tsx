import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useParams, Link } from 'react-router-dom'
import { dexie, Project } from '../../dexieClient'
import { useLiveQuery } from 'dexie-react-hooks'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { FaArrowRight } from 'react-icons/fa'

import ErrorBoundary from '../shared/ErrorBoundary'
import Spinner from '../shared/Spinner'
import FormTitle from './FormTitle'
import Form from './Form'
import storeContext from '../../storeContext'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
`

const ProjectComponent = ({ filter: showFilter }) => {
  const { projectId } = useParams()
  const store = useContext(storeContext)
  const { activeNodeArray } = store
  const filter = 'TODO: was in store'

  const row: Project = useLiveQuery(
    async () => await dexie.projects.get(projectId),
    [projectId],
  )

  console.log('Project rendering, activeNodeArray:', activeNodeArray.slice())

  if (!row) return <Spinner />
  if (!showFilter && filter.show) return null

  return (
    <ErrorBoundary>
      <Container showfilter={showFilter}>
        <FormTitle row={row} showFilter={showFilter} />
        <Form showFilter={showFilter} id={projectId} row={row} />
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            endIcon={<FaArrowRight />}
            //onClick={onClickTabellen}
            component={Link}
            to="tables"
          >
            Tabellen
          </Button>
        </Stack>
      </Container>
    </ErrorBoundary>
  )
}

export default observer(ProjectComponent)
