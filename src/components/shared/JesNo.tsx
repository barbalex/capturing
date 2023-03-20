import React, { useCallback, useState, useEffect } from 'react'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormControlLabel from '@mui/material/FormControlLabel'
import styled from '@emotion/styled'

import toStringIfPossible from '../../utils/toStringIfPossible'

const Container = styled.div`
  display: block;
`
// without slight padding radio is slightly cut off!
const StyledFormControl = styled(FormControl)`
  padding-left: 1px !important;
  padding-bottom: 19px !important;
  break-inside: avoid;
`
const StyledFormLabel = styled(FormLabel)`
  padding-top: 1px !important;
  color: rgba(0, 0, 0, 0.8);
  cursor: text;
  user-select: none;
  pointer-events: none;
  padding-bottom: 8px !important;
`
const StyledRadio = styled(Radio)`
  height: 2px !important;
`
const dataSource = [
  {
    value: 1,
    label: 'Ja',
  },
  {
    value: 0,
    label: 'Nein',
  },
]

// TODO: test because of change true/false to 1/0

interface Props {
  value: 1 | 0 | null | undefined
  label: string
  name: string
  error?: string
  helperText?: string
  onBlur: () => void
}

const RadioButtonGroup = ({
  value: valuePassed,
  label,
  name,
  error,
  helperText = '',
  onBlur,
}: Props) => {
  const [stateValue, setStateValue] = useState(valuePassed)
  useEffect(() => {
    setStateValue(valuePassed)
  }, [valuePassed])

  const onClickButton = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      /**
       * if clicked element is active value: set null
       * Problem: does not work on change event on RadioGroup
       * because that only fires on changes
       * Solution: do this in click event of button
       */
      const targetValue = event.target.value

      if (targetValue == stateValue) {
        // an already active option was clicked
        // set value null
        setStateValue(null)
        const fakeEvent = {
          target: {
            value: null,
            name,
          },
        }
        return onBlur(fakeEvent)
      }
    },
    [stateValue, name, onBlur],
  )
  const onChangeGroup = useCallback(
    (event) => {
      // group only changes if value changes
      const targetValue = event.target.value === '1' ? 1 : 0
      setStateValue(targetValue)
      const fakeEvent = {
        target: {
          value: targetValue,
          name,
        },
      }
      onBlur(fakeEvent)
    },
    [name, onBlur],
  )

  const valueSelected =
    stateValue !== null && stateValue !== undefined
      ? toStringIfPossible(stateValue)
      : ''

  return (
    <Container>
      <StyledFormControl
        component="fieldset"
        error={!!error}
        aria-describedby={`${label}ErrorText`}
        variant="standard"
      >
        <StyledFormLabel component="legend">{label}</StyledFormLabel>
        <RadioGroup
          aria-label={label}
          value={valueSelected}
          onChange={onChangeGroup}
        >
          {dataSource.map((e, index) => (
            <FormControlLabel
              key={index}
              value={e.value}
              control={<StyledRadio color="primary" />}
              label={e.label}
              onClick={onClickButton}
            />
          ))}
        </RadioGroup>
        {!!error && (
          <FormHelperText id={`${label}ErrorText`}>{error}</FormHelperText>
        )}
        {!!helperText && (
          <FormHelperText id={`${label}HelperText`}>
            {helperText}
          </FormHelperText>
        )}
      </StyledFormControl>
    </Container>
  )
}

export default RadioButtonGroup
