import { useMemo, useContext } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import Slider from 'react-slick'
import { useQuery } from 'react-query'

import { supabase } from '../../../supabaseClient'
import checkForOnlineError from '../../../utils/checkForOnlineError'
import Spinner from '../../shared/Spinner'
import storeContext from '../../../storeContext'
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

const RowHistory = ({ row }) => {
  const store = useContext(storeContext)
  const priorRevisions = row?.revisions?.slice(1) ?? []

  const { isLoading, error, data } = useQuery('historyData', () =>
    supabase.from('row_revs').select(),
  )

  console.log('RowHistory, results:', {
    priorRevisions,
    data,
    error,
    isLoading,
  })

  // console.log('RowHistory rendering')

  return <div>History</div>
}

export default observer(RowHistory)
