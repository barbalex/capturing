import React, { useCallback, useState, useEffect } from 'react'
import Checkbox from '@mui/material/Checkbox'
import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import styled from '@emotion/styled'

const StyledFormControl = styled(FormControl)`
  margin-top: -15px;
  padding-bottom: 15px !important;
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
const StyledCheckbox = styled(Checkbox)`
  height: 2px !important;
  width: 24px;
`

type Props = {
  label: string
  name: string
  value: boolean
  error: string
  onBlur: () => void
}

const Checkbox2States = ({
  label,
  name,
  value: valuePassed,
  error,
  onBlur,
}: Props) => {
  const [stateValue, setStateValue] = useState<string>(valuePassed)
  useEffect(() => {
    setStateValue(valuePassed)
  }, [valuePassed])

  const onClickButton = useCallback(() => {
    const newValue = stateValue === 0 ? 1 : 0
    setStateValue(newValue)
    const fakeEvent = {
      target: {
        value: newValue,
        name,
      },
    }
    onBlur(fakeEvent)
  }, [stateValue, name, onBlur])

  const checked = stateValue === 1

  return (
    <StyledFormControl error={!!error} aria-describedby={`${label}ErrorText`}>
      <StyledFormLabel component="legend">{label}</StyledFormLabel>
      <StyledCheckbox
        data-id={name}
        onClick={onClickButton}
        color="primary"
        checked={checked}
      />
      {!!error && (
        <FormHelperText id={`${label}ErrorText`}>{error}</FormHelperText>
      )}
    </StyledFormControl>
  )
}

export default Checkbox2States
