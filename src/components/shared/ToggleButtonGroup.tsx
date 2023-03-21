import React, { useCallback, useState, useEffect } from 'react'
import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import IconButton from '@mui/material/IconButton'
import { MdInfoOutline as InfoIcon } from 'react-icons/md'
import { Link } from 'react-router-dom'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'

import toStringIfPossible from '../../utils/toStringIfPossible'
import { Option } from '../../dexieClient'

// without slight padding radio is slightly cut off!
const StyledFormControl = styled(FormControl)`
  padding-left: 1px !important;
  padding-bottom: 19px !important;
  break-inside: avoid;
  width: 100%;
  .Mui-selected {
    background-color: rgba(74, 20, 140, 0.1);
  }
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
const NoDataMessage = styled.div`
  font-size: small;
  color: grey;
`
const StyledFormHelperText = styled(FormHelperText)`
  line-height: 1.3em;
`
const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
`

interface Props {
  value: number | string | null | undefined
  label: string
  labelSize?: number
  name: string
  error?: string
  helperText?: string
  dataSource: Option[]
  noDataMessage?: string
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void
  infoLink?: string
  infoTitle?: string
}

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
  infoLink,
  infoTitle,
}: Props) => {
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
    (event: React.MouseEvent) => {
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
        <Row>
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
                  // control={<StyledRadio color="primary" />}
                  // label={e.label}
                  onClick={onClickButton}
                >
                  {e.label}
                </ToggleButton>
              ))
            ) : (
              <NoDataMessage>{noDataMessage}</NoDataMessage>
            )}
          </ToggleButtonGroup>
          {infoLink && (
            <div>
              <IconButton
                title={infoTitle ?? 'Information'}
                component={Link}
                to={infoLink}
              >
                <InfoIcon />
              </IconButton>
            </div>
          )}
        </Row>
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
