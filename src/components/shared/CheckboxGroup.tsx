import { useCallback } from 'react'
import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import styled from '@emotion/styled'

const StyledFormControl = styled(FormControl)`
  padding-bottom: 19px;
`
const StyledFormLabel = styled(FormLabel)`
  padding-top: 10px !important;
  padding-bottom: 8px !important;
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.8);
  cursor: text;
  user-select: none;
  pointer-events: none;
`
const StyledFormControlLabel = styled(FormControlLabel)`
  .MuiFormControlLabel-label {
    line-height: 1.4;
  }
`

interface Option {
  value: text
  label: text
}

interface Props {
  value: text[]
  label: text
  name: text
  options: Option[]
  onBlur: () => void
}

const CheckboxGroup = ({ value, label, name, options = [], onBlur }: Props) => {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let newValue
      if (event.target.checked) {
        newValue = [...value, event.target.name]
      } else {
        newValue = [...value].filter((v) => v !== event.target.name)
      }

      onBlur({
        target: {
          value: newValue,
          name,
          type: 'array',
        },
      })
    },
    [name, onBlur, value],
  )

  // console.log('CheckboxGroup', { options, value })

  // containing div needed to prevent control from appearing right of previous
  return (
    <div>
      <StyledFormControl component="fieldset" variant="standard">
        <StyledFormLabel component="legend">{label}</StyledFormLabel>
        {options.map((o) => (
          <StyledFormControlLabel
            key={o.value}
            control={
              <Checkbox
                checked={value.includes(o.value)}
                onChange={handleChange}
                name={o.value}
              />
            }
            label={o.label}
          />
        ))}
      </StyledFormControl>
    </div>
  )
}

export default CheckboxGroup
