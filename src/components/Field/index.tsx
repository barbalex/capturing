import { FC } from 'react'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'

import ErrorBoundary from '../shared/ErrorBoundary'
import FormTitle from './FormTitle'
import Form from './Form'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => (props.showfilter ? '#fff3e0' : 'unset')};
`

interface Props {
  filter: boolean
}

const FieldComponent: FC = ({ filter: showFilter }: Props) => {
  const filter = 'TODO: was in store'

  // console.log('Project rendering row:', { row, projectId })

  if (!showFilter && filter.show) return null

  return (
    <ErrorBoundary>
      <Container showfilter={showFilter}>
        <FormTitle showFilter={showFilter} />
        <Form showFilter={showFilter} />
      </Container>
    </ErrorBoundary>
  )
}

export default observer(FieldComponent)
