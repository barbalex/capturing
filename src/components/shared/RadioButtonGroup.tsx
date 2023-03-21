import React, { useCallback, useState, useEffect } from 'react'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormControlLabel from '@mui/material/FormControlLabel'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'

import toStringIfPossible from '../../utils/toStringIfPossible'
import { Option } from '../../dexieClient'

// without slight padding radio is slightly cut off!
const StyledFormControl = styled(FormControl)`
  padding-left: 1px !important;
  padding-bottom: 19px !important;
  break-inside: avoid;
`
const StyledFormLabel = styled(FormLabel)`
  padding-top: 1px !important;
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.8);
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

interface Props {
  value: any
  label: string
  labelSize?: number
  name: string
  error?: string
  helperText?: string
  dataSource: Option[]
  noDataMessage?: string
  onBlur: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const RadioButtonGroup = ({
  value: valuePassed,
  label,
  labelSize = 1,
  name,
  error,
  helperText = '',
  dataSource = [],
  noDataMessage = undefined,
  onBlur,
}: Props) => {
  const [stateValue, setStateValue] = useState(valuePassed)
  useEffect(() => {
    setStateValue(valuePassed)
  }, [valuePassed])

  const onClickButton = useCallback(
    (event: React.MouseEvent) => {
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
    (event: React.ChangeEvent) => {
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
        <RadioGroup
          aria-label={label}
          value={valueSelected}
          onChange={onChangeGroup}
        >
          {dataSource.length ? (
            dataSource.map((e, index) => (
              <StyledControlLabel
                key={index}
                value={toStringIfPossible(e.value)}
                control={<StyledRadio color="primary" />}
                label={e.label}
                labelsize={labelSize}
                onClick={onClickButton}
              />
            ))
          ) : (
            <NoDataMessage>{noDataMessage}</NoDataMessage>
          )}
        </RadioGroup>
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

export default observer(RadioButtonGroup)
