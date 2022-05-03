import { useState, useEffect, useCallback } from 'react'
import { HexColorPicker } from 'react-colorful'
import FormControl from '@mui/material/FormControl'

import Label from './Label'

const ColorPicker = ({ color = '#ff0000', onBlur, label }) => {
  const [val, setVal] = useState()

  useEffect(() => {
    setVal(color)
  }, [color])

  const onBlurControl = useCallback(() => {
    console.log('ColorPicker, onBlurControl, color:', val)
    const fakeEvent = {
      target: {
        name: 'color',
        value: val,
      },
    }
    onBlur(fakeEvent)
  }, [onBlur, val])

  return (
    <FormControl onBlur={onBlurControl}>
      <Label label={label} />
      <HexColorPicker color={val} onChange={setVal} />

      <p>Aktueller Farb-Wert ist: {val}</p>
    </FormControl>
  )
}

export default ColorPicker
