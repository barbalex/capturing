import { useCallback } from 'react'
import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

type Option = {
  value: text
  label: text
}

type Props = {
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

  return (
    <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
      <FormLabel component="legend">{label}</FormLabel>
      <FormGroup>
        {options.map((v) => (
          <FormControlLabel
            key={v.value}
            control={
              <Checkbox
                checked={value.includes(v.value)}
                onChange={handleChange}
                name={v.value}
              />
            }
            label={v.label}
          />
        ))}
      </FormGroup>
    </FormControl>
  )
}

export default CheckboxGroup
