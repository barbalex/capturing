import * as React from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Slider from '@mui/material/Slider'
import MuiInput from '@mui/material/Input'
import FormHelperText from '@mui/material/FormHelperText'
import { styled } from '@mui/material/styles'

import Label from './Label'

const StyledSlider = styled(Slider)`
  margin-left: 8px;
`
const Input = styled(MuiInput)`
  width: 40px;
`

interface Props {
  value: number | number[] | undefined
  name: string
  label: string
  step?: number
  min?: number
  max?: number
  onBlur: (event: React.ChangeEvent<HTMLInputElement>) => void
  helperText?: string
}

const SliderComponent = ({
  value: valuePassed,
  name,
  label,
  step = 10,
  min = 0,
  max = 100,
  onBlur,
  helperText,
}: Props) => {
  const [value, setValue] = React.useState<number | number[]>(valuePassed ?? 0)

  const handleSliderChange = (event, newValue) => {
    setValue(newValue)
    onBlur({
      target: {
        name,
        value: newValue,
      },
    })
  }

  const handleInputChange = (event) => {
    setValue(event.target.value === '' ? '' : Number(event.target.value))
  }

  const handleBlur = () => {
    let newValue
    if (value < min) {
      newValue = min
    } else if (value > max) {
      newValue = max
    }
    setValue(newValue)
    onBlur({
      target: {
        name,
        value: newValue,
      },
    })
  }

  return (
    <Box>
      <Label id="input-slider" label={label} />
      <Grid container spacing={2} alignItems="center">
        <Grid item xs>
          <StyledSlider
            value={value}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            valueLabelDisplay="auto"
            min={min}
            step={step}
            max={max}
          />
        </Grid>
        <Grid item>
          <Input
            value={value}
            size="small"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step,
              min,
              max,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
          />
        </Grid>
      </Grid>
      {!!helperText && <FormHelperText>{helperText}</FormHelperText>}
    </Box>
  )
}

export default SliderComponent
