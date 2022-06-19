import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import Slider from 'react-slick'
import { useQuery } from 'react-query'

import { supabase } from '../../../supabaseClient'
import Spinner from '../../shared/Spinner'
import Row from './Row'

export async function loader() {
  // TODO: fetch data
  return ['test']
}

const Container = styled.div`
  overflow-y: auto;
  padding: 0 25px;
  height: 100%;
  .slick-prev:before,
  .slick-next:before,
  .slick-dots li button:before {
    color: #4a148c;
  }
  .slick-prev {
    left: -20px;
  }
  .slick-next {
    right: -20px;
  }
  .slick-dots {
    bottom: -10px;
  }
`
const ErrorContainer = styled.div`
  padding: 25px;
`

const sliderSettings = {
  dots: false,
  infinite: false,
}

const RowHistory = ({ row, historyTakeoverCallback }) => {
  const priorRevisions = row?.revisions?.slice(1) ?? []

  const { isLoading, isError, error, data } = useQuery(
    ['row', row.id, priorRevisions, 'revisions'],
    async () => {
      const { error, data } = await supabase
        .from('row_revs')
        .select()
        .in('rev', priorRevisions)

      if (error) throw error

      return data
    },
  )

  console.log('RowHistory, results:', {
    priorRevisions,
    data,
    error,
    isLoading,
  })

  if (isLoading) return <Spinner message="lade Versionen" />

  // console.log('RowHistory rendering')
  if (isError) return <ErrorContainer>{error.message}</ErrorContainer>

  return (
    <Container>
      <Slider {...sliderSettings}>
        {data.map((r) => (
          <Row
            key={row.rev}
            revRow={r}
            row={row}
            historyTakeoverCallback={historyTakeoverCallback}
          />
        ))}
      </Slider>
    </Container>
  )
}

export default observer(RowHistory)
