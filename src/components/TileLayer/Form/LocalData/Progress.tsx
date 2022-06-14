import { useContext, useEffect } from 'react'
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { observer } from 'mobx-react-lite'

import storeContext from '../../../../storeContext'

const Progress = ({ showProgress, setShowProgress, setDownloading }) => {
  const store = useContext(storeContext)
  const { localMapLoadingFraction } = store

  useEffect(() => {
    let timeoutID
    if (localMapLoadingFraction === 1) {
      setDownloading(false)
      timeoutID = setTimeout(() => setShowProgress(false), 3000)
    }

    return () => {
      if (timeoutID) clearTimeout(timeoutID)
    }
  }, [localMapLoadingFraction, setDownloading, setShowProgress])

  if (showProgress)
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={localMapLoadingFraction * 100}
          />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">{`${Math.round(
            localMapLoadingFraction * 100,
          )}%`}</Typography>
        </Box>
      </Box>
    )
}

export default observer(Progress)
