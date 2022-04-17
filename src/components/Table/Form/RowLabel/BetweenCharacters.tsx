import { useCallback } from 'react'
import TextField from '@mui/material/TextField'
import styled from 'styled-components'

import { dexie } from '../../../../dexieClient'

const Container = styled.div`
  position: relative;
`
const StyledTextField = styled(TextField)`
  margin-right: 6px;
  margin-bottom: 0;
  width: 100px;
  label {
    font-size: small !important;
    padding-left: 6px;
  }
  input {
    font-size: small !important;
  }
`

const BetweenCharacters = ({ el, rowState, index, children }) => {
  const onBlur = useCallback(
    (event) => {
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
    <Container>
      <StyledTextField
        label="Zeichen"
        variant="outlined"
        margin="dense"
        size="small"
        defaultValue={el.text ?? ''}
        onBlur={onBlur}
      />
      {children}
    </Container>
  )
}

export default BetweenCharacters
