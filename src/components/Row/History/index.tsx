import styled from '@emotion/styled'
import Slider from 'react-slick'
import { useQuery } from 'react-query'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

import { supabase } from '../../../supabaseClient'
import Spinner from '../../shared/Spinner'
import checkForOnlineError from '../../../utils/checkForOnlineError'
import RowComponent from './Row'
import { Row } from '../../../dexieClient'

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
  dots: true,
  infinite: true,
}

interface Props {
  row: Row
  restoreCallback: () => void
}

const RowHistory = ({ row, restoreCallback }: Props) => {
  const priorRevisions = row?.revisions?.slice(1) ?? []

  const { isLoading, isError, error, data } = useQuery(
    ['row', row.id, priorRevisions, 'revisions'],
    async () => {
      const { error, data } = await supabase
        .from('row_revs')
        .select()
        .in('rev', priorRevisions)
        .order('depth', { ascending: false })

      if (error) throw error

      return data
    },
  )

  error && checkForOnlineError({ error, store })

  if (isLoading) return <Spinner message="lade Versionen" />

  // console.log('RowHistory rendering')
  if (isError) return <ErrorContainer>{error.message}</ErrorContainer>

  return (
    <Container>
      <Slider {...sliderSettings}>
        {data.map((r) => (
          <RowComponent
            key={row.rev}
            revRow={r}
            row={row}
            restoreCallback={restoreCallback}
          />
        ))}
      </Slider>
    </Container>
  )
}

export default RowHistory
