import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useParams, Link } from 'react-router-dom'
import { dexie, Project } from '../../dexieClient'
import { useLiveQuery } from 'dexie-react-hooks'
import Button from '@mui/material/Button'
import { FaArrowRight } from 'react-icons/fa'

import ErrorBoundary from '../shared/ErrorBoundary'
import Spinner from '../shared/Spinner'
import FormTitle from './FormTitle'
import Form from './Form'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
`
const TopNavContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 5px 10px 5px 10px;
`

const ProjectComponent = ({ filter: showFilter }) => {
  const { projectId } = useParams()
  const filter = 'TODO: was in store'

  const row: Project = useLiveQuery(
    async () => await dexie.projects.get(projectId),
    [projectId],
  )

  // console.log('Project rendering, activeNodeArray:', activeNodeArray.slice())

  if (!row) return <Spinner />
  if (!showFilter && filter.show) return null

  return (
    <ErrorBoundary>
      <Container showfilter={showFilter}>
        <FormTitle row={row} showFilter={showFilter} />
        <TopNavContainer>
          <Button endIcon={<FaArrowRight />} component={Link} to="tables">
            Tabellen
          </Button>
        </TopNavContainer>
        <Form showFilter={showFilter} id={projectId} row={row} />
      </Container>
    </ErrorBoundary>
  )
}

export default observer(ProjectComponent)
