import { useState, useEffect, useCallback } from 'react'
import { HexColorPicker } from 'react-colorful'
import FormControl from '@mui/material/FormControl'
import Input from '@mui/material/Input'
import styled from 'styled-components'

import Label from './Label'

const InputRow = styled.div`
  display: flex;
`
const InputLabel = styled.div`
  color: rgba(0, 0, 0, 0.5);
  padding-right: 8px;
  align-self: center;
`
const StyledFormControl = styled(FormControl)`
  padding-bottom: 19px !important;
`
const StyledInput = styled(Input)`
  &:before {
    border-bottom-color: rgba(0, 0, 0, 0.1) !important;
  }
  width: 70px;
`

const ColorPicker = ({ color = '#ff0000', onBlur, label, name, disabled }) => {
  const [val, setVal] = useState('')

  useEffect(() => {
    setVal(color ?? '')
  }, [color])

  const onBlurControl = useCallback(() => {
    const fakeEvent = {
      target: {
        name,
        value: val,
      },
    }
    onBlur(fakeEvent)
  }, [name, onBlur, val])
  const onBlurInput = useCallback(() => {
    setTimeout(() => onBlurControl)
  }, [onBlurControl])

  // weird placing without the div
  return (
    <div>
      <StyledFormControl onBlur={onBlurControl}>
        <Label label={label} />
        <HexColorPicker color={val} onChange={setVal} />
        <InputRow>
          <InputLabel>Hex-Wert:</InputLabel>
          <StyledInput
            id="input"
            name={name}
            value={val}
            type="text"
            onChange={(e) => setVal(e.target.value)}
            onBlur={onBlurInput}
            disabled={disabled}
          />
        </InputRow>
      </StyledFormControl>
    </div>
  )
}

export default ColorPicker
