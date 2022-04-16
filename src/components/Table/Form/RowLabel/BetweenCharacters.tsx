import { useCallback } from 'react'
import TextField from '@mui/material/TextField'
import styled from 'styled-components'

import { dexie } from '../../../../dexieClient'

const StyledTextField = styled(TextField)`
  margin-right: 4px;
  margin-bottom: 0;
  width: 110px;
  label {
    font-size: small !important;
  }
  input {
    font-size: small !important;
  }
`

const BetweenCharacters = ({ el, rowState, index }) => {
  const onBlur = useCallback(
    (event) => {
      // TODO:

      const clonedRowLabel = [...rowState.current.row_label]
      clonedRowLabel[index].text = event.target.value
      const newRow = {
        ...rowState.current,
        row_label: clonedRowLabel.length ? clonedRowLabel : null,
      }
      rowState.current = newRow
      dexie.ttables.put(newRow)
    },
    [index, rowState],
  )
  return (
    <StyledTextField
      label="Zwischen-Zeichen"
      variant="outlined"
      margin="dense"
      size="small"
      defaultValue={el.text ?? ''}
      onBlur={onBlur}
    />
  )
}

export default BetweenCharacters
