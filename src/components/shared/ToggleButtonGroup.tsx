import React, { useCallback, useState, useEffect } from 'react'
import Radio from '@mui/material/Radio'
import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormControlLabel from '@mui/material/FormControlLabel'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'

import toStringIfPossible from '../../utils/toStringIfPossible'

// without slight padding radio is slightly cut off!
const StyledFormControl = styled(FormControl)`
  padding-left: 1px !important;
  padding-bottom: 19px !important;
  break-inside: avoid;
`
const StyledFormLabel = styled(FormLabel)`
  padding-top: 1px !important;
  font-size: 12px !important;
  cursor: text;
  user-select: none;
  pointer-events: none;
  padding-bottom: 8px !important;
`
const StyledRadio = styled(Radio)`
  /* height: 2px !important; */
`
const NoDataMessage = styled.div`
  font-size: small;
  color: grey;
`
const StyledControlLabel = styled(FormControlLabel)`
  min-height: 24px;
  .MuiFormControlLabel-label {
    font-size: ${(props) => props.labelsize * 1}rem !important;
    white-space: pre-wrap;
  }
`
const StyledFormHelperText = styled(FormHelperText)`
  line-height: 1.3em;
`

const ToggleButtonGroupComponent = ({
  value: valuePassed,
  label,
  labelSize = 1,
  name,
  error,
  helperText = '',
  dataSource = [],
  noDataMessage = undefined,
  onBlur,
}) => {
  const [stateValue, setStateValue] = useState(valuePassed)
  useEffect(() => {
    setStateValue(valuePassed)
  }, [valuePassed])

  const onClickButton = useCallback(
    (event) => {
      /**
       * if clicked element is active value: set null
       * Problem: does not work on change event on RadioGroup
       * because that only fires on changes
       * Solution: do this in click event of button
       */
      const targetValue = event.target.value
      // eslint-disable-next-line eqeqeq
      if (targetValue !== undefined && targetValue == stateValue) {
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
      const targetValue = event.target.value
      // values are passed as strings > need to convert
      const newValue =
        targetValue === '1'
          ? 1
          : targetValue === '0'
          ? 0
          : isNaN(targetValue)
          ? targetValue
          : +targetValue
      setStateValue(newValue)
      const fakeEvent = {
        target: {
          value: newValue,
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
    <div>
      <StyledFormControl
        component="fieldset"
        error={!!error}
        aria-describedby={`${label}ErrorText`}
        variant="standard"
      >
        <StyledFormLabel component="legend" labelsize={labelSize}>
          {label}
        </StyledFormLabel>
        <ToggleButtonGroup
          aria-label={label}
          value={valueSelected}
          onChange={onChangeGroup}
        >
          {dataSource.length ? (
            dataSource.map((e, index) => (
              <ToggleButton
                key={index}
                value={toStringIfPossible(e.value)}
                control={<StyledRadio color="primary" />}
                label={e.label}
                onClick={onClickButton}
              />
            ))
          ) : (
            <NoDataMessage>{noDataMessage}</NoDataMessage>
          )}
        </ToggleButtonGroup>
        {!!error && (
          <StyledFormHelperText id={`${label}ErrorText`}>
            {error}
          </StyledFormHelperText>
        )}
        {!!helperText && (
          <StyledFormHelperText id={`${label}HelperText`}>
            {helperText}
          </StyledFormHelperText>
        )}
      </StyledFormControl>
    </div>
  )
}

export default observer(ToggleButtonGroupComponent)
